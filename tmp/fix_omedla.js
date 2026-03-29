require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const { randomUUID } = require('crypto');

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BUCKET = 'place-images';
const PLACE_ID = '697bbaf2-0ad3-4d34-88ef-9259b61f9a3b';
const PLACE_NAME = 'Omedla Hotel';

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
  console.log(`Fixing: ${PLACE_NAME}`);

  // Step 1: Delete ALL existing images
  const { data: existing } = await sb.from('PlaceImage').select('id').eq('placeId', PLACE_ID);
  console.log(`Deleting ${existing?.length} existing image records...`);
  if (existing?.length > 0) {
    const { error } = await sb.from('PlaceImage').delete().eq('placeId', PLACE_ID);
    if (error) console.log('Delete error:', error.message);
    else console.log('✅ All old images deleted');
  }

  // Step 2: Try specific Google Places searches
  const queries = [
    'Omedla Hotel Addis Ababa Ethiopia',
    'Omedla hotel Ethiopia',
    'hotel Addis Ababa Kazanchis Ethiopia',  // fallback
  ];

  let place = null;
  let usedQuery = '';
  for (const q of queries) {
    console.log(`\nSearching: "${q}"`);
    const result = await searchPlace(q);
    const p = result.places?.[0];
    if (p?.photos?.length > 0) {
      console.log(`Found: "${p.displayName?.text}" with ${p.photos.length} photos`);
      place = p;
      usedQuery = q;
      break;
    } else if (p) {
      console.log(`Found "${p.displayName?.text}" but no photos`);
    } else {
      console.log('Not found');
    }
  }

  if (!place) {
    console.log('\n❌ Could not find photos. Leaving place with no images.');
    return;
  }

  const isExact = usedQuery.startsWith('Omedla');
  const truthType = isExact ? 'place_real' : 'representative';
  const photos = place.photos.slice(0, 5);
  console.log(`\nUploading ${photos.length} photos [${truthType}]...`);

  let uploaded = 0;
  for (let i = 0; i < photos.length; i++) {
    const photoId = photos[i].name.split('/').pop();
    const filename = `places/${PLACE_ID}/${photoId}.jpg`;
    const buf = await fetchPhotoBytes(photos[i].name);
    if (!buf) { console.log(`  ⚠ Photo ${i+1}: no bytes`); continue; }

    const { error: upErr } = await sb.storage.from(BUCKET).upload(filename, buf, { contentType: 'image/jpeg', upsert: true });
    if (upErr) { console.log(`  💥 Upload error: ${upErr.message}`); continue; }
    const { data: { publicUrl } } = sb.storage.from(BUCKET).getPublicUrl(filename);

    const { error: dbErr } = await sb.from('PlaceImage').insert({
      id: randomUUID(), placeId: PLACE_ID, imageUrl: publicUrl,
      mirroredUrl: publicUrl, imageSource: 'google_places',
      altText: `${PLACE_NAME} photo ${i+1}`, priority: i,
      status: 'APPROVED', isMirrored: true, qualityScore: 80,
      imageTruthType: truthType,
    });
    if (dbErr) { console.log(`  💥 DB error: ${dbErr.message}`); continue; }
    console.log(`  ✅ Photo ${i+1}/${photos.length} (${(buf.length/1024).toFixed(1)} KB)`);
    uploaded++;
  }
  console.log(`\n✅ Done — ${uploaded} photos uploaded for ${PLACE_NAME}`);
}

main().catch(console.error);
