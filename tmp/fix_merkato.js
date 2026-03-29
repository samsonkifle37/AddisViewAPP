require('dotenv').config({ path: 'H:/AddisView/.env.local' });
const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const { randomUUID } = require('crypto');

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BUCKET = 'place-images';
const PLACE_ID = '5985c0a2-ac20-4a0e-86c0-df5c199ce441';

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 15000 }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks) }));
    }).on('error', reject);
  });
}

function searchPlace(query) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ textQuery: query, maxResultCount: 1, languageCode: 'en', regionCode: 'ET' });
    const opts = {
      hostname: 'places.googleapis.com', path: '/v1/places:searchText', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.photos', 'Content-Length': Buffer.byteLength(body) }
    };
    const req = https.request(opts, res => {
      const c = []; res.on('data', d => c.push(d));
      res.on('end', () => resolve(JSON.parse(Buffer.concat(c).toString())));
    });
    req.on('error', reject); req.write(body); req.end();
  });
}

async function fetchPhoto(photoName) {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=900&maxWidthPx=1400&key=${API_KEY}&skipHttpRedirect=true`;
  const r = await httpGet(url);
  if (r.status !== 200) return null;
  try {
    const j = JSON.parse(r.body.toString());
    if (j.photoUri) { const r2 = await httpGet(j.photoUri); return r2.status === 200 ? r2.body : null; }
  } catch {}
  return null;
}

async function main() {
  console.log('Searching Google Places for Merkato Market...');
  const result = await searchPlace('Merkato market Addis Ababa Ethiopia shopping');
  const place = result.places?.[0];
  if (!place) { console.log('Not found'); return; }
  
  const photos = place.photos || [];
  console.log(`Found "${place.displayName?.text}" with ${photos.length} photo(s)`);

  // Delete existing images
  await sb.from('PlaceImage').delete().eq('placeId', PLACE_ID);
  console.log('Cleared old images');

  let uploaded = 0;
  for (let i = 0; i < Math.min(photos.length, 5); i++) {
    const photoId = photos[i].name.split('/').pop();
    const filename = `places/${PLACE_ID}/${photoId}.jpg`;
    const buf = await fetchPhoto(photos[i].name);
    if (!buf) { console.log(`  ⚠ Photo ${i+1}: no data`); continue; }
    
    await sb.storage.from(BUCKET).upload(filename, buf, { contentType: 'image/jpeg', upsert: true });
    const { data: { publicUrl } } = sb.storage.from(BUCKET).getPublicUrl(filename);
    
    await sb.from('PlaceImage').insert({
      id: randomUUID(), placeId: PLACE_ID,
      imageUrl: publicUrl, mirroredUrl: publicUrl,
      imageSource: 'google_places', altText: `Merkato Market photo ${i+1}`,
      priority: i, status: 'APPROVED', isMirrored: true,
      qualityScore: 80, imageTruthType: 'place_real'
    });
    console.log(`  ✅ Photo ${i+1}/${Math.min(photos.length,5)} uploaded (${(buf.length/1024).toFixed(1)} KB)`);
    uploaded++;
  }
  console.log(`\nDone — ${uploaded} photos uploaded for Merkato Market`);
}
main().catch(console.error);
