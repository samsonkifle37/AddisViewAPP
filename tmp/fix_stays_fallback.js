/**
 * Fallback image fix for stays that truly have no google_places images.
 * Uses paginated check to avoid the 1000-row cap bug.
 */
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
const DELAY_MS = 400;

// Varied fallback queries for representative hotel images
const FALLBACK_QUERIES = [
  'luxury hotel Bole Addis Ababa Ethiopia',
  'boutique hotel Kazanchis Addis Ababa Ethiopia',
  'hotel Piazza Addis Ababa Ethiopia',
  'guesthouse Addis Ababa Ethiopia interior',
  'hotel lobby Addis Ababa Ethiopia',
  'hotel Bole Michael Addis Ababa Ethiopia',
  'hotel rooms Addis Ababa Ethiopia',
  'guesthouse room Addis Ababa Ethiopia cozy',
];

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

async function uploadToSupabase(buffer, filename) {
  const { error } = await sb.storage.from(BUCKET).upload(filename, buffer, { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;
  const { data: { publicUrl } } = sb.storage.from(BUCKET).getPublicUrl(filename);
  return publicUrl;
}

async function insertImage(placeId, imageUrl, altText, priority, truthType) {
  const { error } = await sb.from('PlaceImage').insert({
    id: randomUUID(), placeId, imageUrl, mirroredUrl: imageUrl,
    imageSource: 'google_places', altText, priority,
    status: 'APPROVED', isMirrored: true, qualityScore: 70,
    imageTruthType: truthType,
  });
  if (error) throw error;
}

// PAGINATED: get all placeIds that have google_places images (avoids 1000-row cap)
async function getGoogleCoveredIds() {
  const covered = new Set();
  let page = 0;
  const PAGE_SIZE = 1000;
  while (true) {
    const { data } = await sb.from('PlaceImage')
      .select('placeId')
      .eq('imageSource', 'google_places')
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    if (!data || data.length === 0) break;
    data.forEach(r => covered.add(r.placeId));
    if (data.length < PAGE_SIZE) break;
    page++;
  }
  return covered;
}

async function findPhotos(stay, queryIndex) {
  const queries = [
    `${stay.name} ${stay.type} Addis Ababa Ethiopia`,
    FALLBACK_QUERIES[queryIndex % FALLBACK_QUERIES.length],
    FALLBACK_QUERIES[(queryIndex + 1) % FALLBACK_QUERIES.length],
  ];
  for (const q of queries) {
    try {
      const result = await searchPlace(q);
      const place = result.places?.[0];
      if (place?.photos?.length > 0) return { place, query: q };
    } catch {}
    await sleep(200);
  }
  return null;
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  AddisView — Stays Fallback Image Fix (Paginated)    ║');
  console.log('╚══════════════════════════════════════════════════════╝');

  console.log('\nFetching all stay-type places...');
  const { data: allStays } = await sb.from('Place')
    .select('id, name, type')
    .eq('isActive', true).eq('status', 'APPROVED')
    .in('type', ['hotel', 'guesthouse', 'apartment', 'resort']);

  console.log(`Total stays: ${allStays.length}`);
  console.log('Fetching covered IDs (paginated)...');
  const coveredIds = await getGoogleCoveredIds();
  console.log(`Stays with google_places images: ${coveredIds.size}`);

  const remaining = allStays.filter(s => !coveredIds.has(s.id));
  console.log(`Stays truly needing images: ${remaining.length}\n`);

  if (remaining.length === 0) {
    console.log('✅ All stays already have Google Places images!');
    return;
  }

  let fixed = 0, failed = 0;

  for (let i = 0; i < remaining.length; i++) {
    const stay = remaining[i];
    process.stdout.write(`[${i+1}/${remaining.length}] ${stay.name} (${stay.type})\n`);

    const found = await findPhotos(stay, i);
    if (!found) {
      process.stdout.write(`  ✗ No photos found\n`);
      failed++;
      await sleep(DELAY_MS);
      continue;
    }

    const { place, query } = found;
    const isExact = query.startsWith(stay.name);
    const truthType = isExact ? 'place_real' : 'representative';
    const photos = place.photos.slice(0, isExact ? 5 : 3);
    process.stdout.write(`  📸 "${place.displayName?.text}" [${truthType}] — ${photos.length} photo(s)\n`);

    let uploaded = 0;
    for (let p = 0; p < photos.length; p++) {
      const photoId = photos[p].name.split('/').pop();
      const filename = `places/${stay.id}/${photoId}.jpg`;
      try {
        const buf = await fetchPhotoBytes(photos[p].name);
        if (!buf) continue;
        const url = await uploadToSupabase(buf, filename);
        await insertImage(stay.id, url, `${stay.name} photo ${p+1}`, p, truthType);
        process.stdout.write(`  ✅ Photo ${p+1} (${(buf.length/1024).toFixed(1)} KB)\n`);
        uploaded++;
      } catch (e) {
        process.stdout.write(`  💥 Photo ${p+1}: ${e.message}\n`);
      }
    }
    if (uploaded > 0) fixed++;
    else failed++;
    await sleep(DELAY_MS);
  }

  console.log('\n' + '═'.repeat(54));
  console.log(`✅ Fixed: ${fixed}  |  ❌ Could not fix: ${failed}`);
  console.log('═'.repeat(54));
}

main().catch(console.error);
