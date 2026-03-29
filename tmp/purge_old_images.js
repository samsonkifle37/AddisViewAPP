require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const { randomUUID } = require('crypto');
const fs = require('fs');

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BUCKET = 'place-images';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 15000 }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
    }).on('error', reject).on('timeout', () => reject(new Error('timeout')));
  });
}

async function searchPlace(query) {
  const body = JSON.stringify({ textQuery: query, maxResultCount: 1, languageCode: 'en', regionCode: 'ET' });
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'places.googleapis.com', path: '/v1/places:searchText', method: 'POST',
      headers: {
        'Content-Type': 'application/json', 'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.photos',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(opts, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString())); } catch(e) { reject(e); } });
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

async function fetchPhotoBytes(photoName) {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&maxWidthPx=1200&key=${GOOGLE_API_KEY}&skipHttpRedirect=true`;
  const r = await httpGet(url);
  if (r.status !== 200) return null;
  try {
    const j = JSON.parse(r.body.toString());
    if (j.photoUri) { const r2 = await httpGet(j.photoUri); return r2.status === 200 ? r2.body : null; }
  } catch {}
  return null;
}

async function main() {
  // Step 1: Get all old googleapis image records
  console.log('Step 1: Finding all old maps.googleapis.com image records...');
  const oldImgs = [];
  let page = 0;
  while (true) {
    const { data } = await sb.from('PlaceImage')
      .select('id, placeId').ilike('imageUrl', '%maps.googleapis.com%')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (!data || data.length === 0) break;
    oldImgs.push(...data);
    if (data.length < 1000) break;
    page++;
  }
  const affectedPlaceIds = [...new Set(oldImgs.map(r => r.placeId))];
  console.log(`Found ${oldImgs.length} old records across ${affectedPlaceIds.length} places`);

  // Step 2: Delete all old googleapis records
  console.log('\nStep 2: Deleting all old maps.googleapis.com records...');
  const ids = oldImgs.map(r => r.id);
  let deleted = 0;
  for (let i = 0; i < ids.length; i += 100) {
    const { error } = await sb.from('PlaceImage').delete().in('id', ids.slice(i, i + 100));
    if (error) console.log('Delete error:', error.message);
    else deleted += Math.min(100, ids.length - i);
  }
  console.log(`✅ Deleted ${deleted} old image records`);

  // Step 3: Find which affected places now have NO images at all
  console.log('\nStep 3: Checking which affected places now have no images...');
  const { data: remaining } = await sb.from('PlaceImage')
    .select('placeId').in('placeId', affectedPlaceIds);
  const stillCovered = new Set((remaining || []).map(r => r.placeId));
  const needsRefetch = affectedPlaceIds.filter(id => !stillCovered.has(id));
  console.log(`Places now with NO images: ${needsRefetch.length}`);

  if (needsRefetch.length === 0) {
    console.log('\n✅ All affected places still have other images. Done!');
    return;
  }

  // Get names for places needing refetch
  const { data: places } = await sb.from('Place')
    .select('id, name, type').in('id', needsRefetch);
  console.log('\nPlaces needing image refetch:');
  places?.forEach(p => console.log(`  - ${p.name} (${p.type})`));

  // Step 4: Refetch images for places that are now empty
  console.log('\nStep 4: Refetching images...');
  let fixed = 0;
  for (let i = 0; i < (places || []).length; i++) {
    const place = places[i];
    const typeHint = { hotel: 'hotel', guesthouse: 'guesthouse', restaurant: 'restaurant', cafe: 'cafe', coffee: 'coffee shop' }[place.type] || place.type;
    const query = `${place.name} ${typeHint} Addis Ababa Ethiopia`;
    process.stdout.write(`[${i+1}/${places.length}] ${place.name}\n  🔍 "${query}"\n`);

    try {
      const result = await searchPlace(query);
      const gPlace = result.places?.[0];
      if (!gPlace?.photos?.length) {
        process.stdout.write(`  ℹ️  No photos found\n`);
        continue;
      }
      const photos = gPlace.photos.slice(0, 5);
      process.stdout.write(`  📸 "${gPlace.displayName?.text}" — ${photos.length} photos\n`);
      let uploaded = 0;
      for (let p = 0; p < photos.length; p++) {
        const photoId = photos[p].name.split('/').pop();
        const filename = `places/${place.id}/${photoId}.jpg`;
        const buf = await fetchPhotoBytes(photos[p].name);
        if (!buf) continue;
        await sb.storage.from(BUCKET).upload(filename, buf, { contentType: 'image/jpeg', upsert: true });
        const { data: { publicUrl } } = sb.storage.from(BUCKET).getPublicUrl(filename);
        await sb.from('PlaceImage').insert({
          id: randomUUID(), placeId: place.id, imageUrl: publicUrl,
          mirroredUrl: publicUrl, imageSource: 'google_places',
          altText: `${place.name} photo ${p+1}`, priority: p,
          status: 'APPROVED', isMirrored: true, qualityScore: 80, imageTruthType: 'place_real',
        });
        process.stdout.write(`  ✅ Photo ${p+1}\n`);
        uploaded++;
      }
      if (uploaded > 0) fixed++;
    } catch (e) {
      process.stdout.write(`  💥 Error: ${e.message}\n`);
    }
    await sleep(300);
  }

  console.log(`\n✅ Done — ${fixed}/${(places || []).length} places refetched`);
}

main().catch(console.error);
