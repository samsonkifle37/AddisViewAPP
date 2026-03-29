/**
 * Tour Image Migration Script
 * Fetches relevant photos from Google Places for each tour
 * (Tours have no lat/lon, so we search by destination name)
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const { randomUUID } = require('crypto');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BUCKET = 'place-images';
const MAX_PHOTOS = 5;

// Custom search queries per tour name — targeted for best image results
const TOUR_SEARCH_QUERIES = {
  'Addis City Tour':            'Addis Ababa city center Ethiopia landmarks',
  'Mercato Market Tour':        'Mercato market Addis Ababa Ethiopia',
  'Coffee Ceremony Experience': 'Ethiopian coffee ceremony traditional',
  'Entoto Mountain Hike':       'Entoto Mountain Addis Ababa Ethiopia',
  'National Museum Tour':       'National Museum Ethiopia Addis Ababa',
  'Holy Trinity Cathedral Tour':'Holy Trinity Cathedral Addis Ababa',
  'Addis Food Tour':            'Ethiopian food injera traditional Addis Ababa',
  'Street Art Tour':            'Addis Ababa street art murals',
  'Awash National Park Day Trip':'Awash National Park Ethiopia',
  'Debre Libanos Monastery Trip':'Debre Libanos Monastery Ethiopia',
  'Blue Nile Gorge Tour':       'Blue Nile Gorge Ethiopia Abay',
  'Lake Ziway Day Trip':        'Lake Ziway Ethiopia flamingos',
};

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
  const body = JSON.stringify({
    textQuery: query,
    maxResultCount: 1,
    languageCode: 'en',
    regionCode: 'ET',
  });
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'places.googleapis.com',
      path: '/v1/places:searchText',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.photos',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
        catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function fetchPhotoBytes(photoName) {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&maxWidthPx=1200&key=${GOOGLE_API_KEY}&skipHttpRedirect=true`;
  const r = await httpGet(url);
  if (r.status !== 200) return null;
  try {
    const j = JSON.parse(r.body.toString());
    if (j.photoUri) {
      const r2 = await httpGet(j.photoUri);
      return r2.status === 200 ? r2.body : null;
    }
  } catch {}
  return null;
}

async function uploadToSupabase(buffer, filename) {
  const { data, error } = await supabase.storage.from(BUCKET).upload(filename, buffer, {
    contentType: 'image/jpeg', upsert: true,
  });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return publicUrl;
}

async function clearOldImages(placeId) {
  // Remove existing non-google_places images for this tour
  const { error } = await supabase.from('PlaceImage').delete().eq('placeId', placeId);
  if (error) console.log('  ⚠ Could not clear old images:', error.message);
}

async function insertImage(placeId, imageUrl, altText, priority) {
  const { error } = await supabase.from('PlaceImage').insert({
    id:            randomUUID(),
    placeId,
    imageUrl,
    mirroredUrl:   imageUrl,
    imageSource:   'google_places',
    altText,
    priority,
    status:        'APPROVED',
    isMirrored:    true,
    qualityScore:  80,
    imageTruthType:'place_real',
  });
  if (error) throw error;
}

async function processTour(tour) {
  const query = TOUR_SEARCH_QUERIES[tour.name] || `${tour.name} Ethiopia`;
  console.log(`\n🗺  ${tour.name}`);
  console.log(`   Searching: "${query}"`);

  let result;
  try { result = await searchPlace(query); } catch (e) {
    console.log(`   💥 Search failed: ${e.message}`); return 0;
  }

  const place = result.places && result.places[0];
  if (!place) { console.log('   ℹ️  Not found on Google Places'); return 0; }
  if (!place.photos || place.photos.length === 0) {
    console.log(`   ℹ️  Found "${place.displayName?.text}" but no photos`); return 0;
  }

  const photos = place.photos.slice(0, MAX_PHOTOS);
  console.log(`   📸 Found ${photos.length} photo(s) via "${place.displayName?.text}"`);

  // Clear old images first
  await clearOldImages(tour.id);

  let uploaded = 0;
  for (let i = 0; i < photos.length; i++) {
    const photoName = photos[i].name;
    const photoId = photoName.split('/').pop();
    const filename = `tours/${tour.id}/${photoId}.jpg`;
    try {
      const buf = await fetchPhotoBytes(photoName);
      if (!buf) { console.log(`   ⚠ Photo ${i+1}: no bytes`); continue; }
      const url = await uploadToSupabase(buf, filename);
      await insertImage(tour.id, url, `${tour.name} photo ${i+1}`, i);
      const kb = (buf.length / 1024).toFixed(1);
      console.log(`   ✅ Photo ${i+1}/${photos.length} uploaded (${kb} KB)`);
      uploaded++;
    } catch (e) {
      console.log(`   💥 Photo ${i+1} failed: ${e.message}`);
    }
  }
  return uploaded;
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  AddisView — Tour Image Migration Script             ║');
  console.log('╚══════════════════════════════════════════════════════╝');

  const { data: tours, error } = await supabase.from('Place')
    .select('id, name, type')
    .eq('isActive', true).eq('status', 'APPROVED').eq('type', 'tour')
    .order('name');

  if (error) { console.log('DB error:', error); return; }
  console.log(`\nFound ${tours.length} tours to process\n`);

  let totalPhotos = 0;
  let successCount = 0;

  for (const tour of tours) {
    const count = await processTour(tour);
    totalPhotos += count;
    if (count > 0) successCount++;
  }

  console.log('\n' + '═'.repeat(54));
  console.log('SUMMARY');
  console.log('═'.repeat(54));
  console.log(`✅ Tours with new photos: ${successCount} / ${tours.length}`);
  console.log(`📸 Total photos uploaded: ${totalPhotos}`);
  console.log('═'.repeat(54));
}

main().catch(console.error);
