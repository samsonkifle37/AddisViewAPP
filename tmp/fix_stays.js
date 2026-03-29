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
const MAX_PHOTOS = 5;
const DELAY_MS = 300;

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
    const options = {
      hostname: 'places.googleapis.com', path: '/v1/places:searchText', method: 'POST',
      headers: {
        'Content-Type': 'application/json', 'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.photos',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
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

async function clearOldImages(placeId) {
  await sb.from('PlaceImage').delete().eq('placeId', placeId).neq('imageSource', 'google_places');
}

async function insertImage(placeId, imageUrl, altText, priority) {
  const { error } = await sb.from('PlaceImage').insert({
    id: randomUUID(), placeId, imageUrl, mirroredUrl: imageUrl,
    imageSource: 'google_places', altText, priority,
    status: 'APPROVED', isMirrored: true, qualityScore: 80, imageTruthType: 'place_real',
  });
  if (error) throw error;
}

async function processStay(stay, index, total) {
  const typeHint = stay.type === 'hotel' ? 'hotel' : stay.type === 'guesthouse' ? 'guesthouse lodge' : stay.type === 'apartment' ? 'apartment' : 'resort';
  const query = `${stay.name} ${typeHint} Addis Ababa Ethiopia`;
  process.stdout.write(`[${index+1}/${total}] ${stay.name} (${stay.type})\n`);
  process.stdout.write(`  🔍 "${query}"\n`);

  let result;
  try { result = await searchPlace(query); }
  catch (e) { process.stdout.write(`  💥 Search failed: ${e.message}\n`); return 'search_error'; }

  const gPlace = result.places && result.places[0];
  if (!gPlace) { process.stdout.write(`  ℹ️  Not found on Google Places\n`); return 'not_found'; }
  if (!gPlace.photos || gPlace.photos.length === 0) {
    process.stdout.write(`  ℹ️  Found "${gPlace.displayName?.text}" — no photos\n`); return 'no_photos';
  }

  const photos = gPlace.photos.slice(0, MAX_PHOTOS);
  process.stdout.write(`  📸 "${gPlace.displayName?.text}" — ${photos.length} photo(s)\n`);

  await clearOldImages(stay.id);

  let uploaded = 0;
  for (let i = 0; i < photos.length; i++) {
    const photoName = photos[i].name;
    const photoId = photoName.split('/').pop();
    const filename = `places/${stay.id}/${photoId}.jpg`;
    try {
      const buf = await fetchPhotoBytes(photoName);
      if (!buf) { process.stdout.write(`  ⚠ Photo ${i+1}: no bytes\n`); continue; }
      const url = await uploadToSupabase(buf, filename);
      await insertImage(stay.id, url, `${stay.name} photo ${i+1}`, i);
      process.stdout.write(`  ✅ Photo ${i+1}/${photos.length} (${(buf.length/1024).toFixed(1)} KB)\n`);
      uploaded++;
    } catch (e) {
      process.stdout.write(`  💥 Photo ${i+1} failed: ${e.message}\n`);
    }
  }
  return uploaded > 0 ? 'success' : 'upload_failed';
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  AddisView — Fix Stays Placeholder Images            ║');
  console.log('╚══════════════════════════════════════════════════════╝');

  const stays = JSON.parse(fs.readFileSync('tmp/stays_needing_images.json', 'utf8'));
  console.log(`\nLoaded ${stays.length} stays needing image fixes\n`);

  const stats = { success: 0, not_found: 0, no_photos: 0, search_error: 0, upload_failed: 0 };

  for (let i = 0; i < stays.length; i++) {
    const result = await processStay(stays[i], i, stays.length);
    stats[result] = (stats[result] || 0) + 1;
    await sleep(DELAY_MS);
  }

  console.log('\n' + '═'.repeat(54));
  console.log('SUMMARY');
  console.log('═'.repeat(54));
  console.log(`✅ Successfully fixed:  ${stats.success || 0}`);
  console.log(`❌ Not found on Google: ${stats.not_found || 0}`);
  console.log(`📷 Found but no photos: ${stats.no_photos || 0}`);
  console.log(`💥 Search errors:       ${stats.search_error || 0}`);
  console.log(`⚠️  Upload failures:     ${stats.upload_failed || 0}`);
  console.log('═'.repeat(54));
}

main().catch(console.error);
