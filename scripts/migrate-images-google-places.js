/**
 * Google Places API → Supabase Storage Image Migration Script
 * 
 * Usage:
 *   1. Add GOOGLE_PLACES_API_KEY to your .env.local
 *   2. Run: node scripts/migrate-images-google-places.js
 *
 * What it does:
 *   - Fetches places from Supabase that have lat/lng but no approved images
 *   - Searches Google Places API for each place
 *   - Downloads photos and uploads to Supabase Storage (place-images bucket)
 *   - Inserts PlaceImage rows with mirroredUrl pointing to your storage
 *   - Marks images as APPROVED with imageTruthType = "place_real"
 *
 * Options (edit below):
 *   BATCH_SIZE   - how many places to process per run (default: 20)
 *   MAX_PHOTOS   - max photos per place (default: 5)
 *   DRY_RUN      - set true to preview without writing (default: false)
 */

require('dotenv').config({ path: '.env.local' });
const { randomUUID } = require('crypto');
const fs = require('fs');
const ATTEMPTED_FILE = 'tmp/google_places_attempted.json';
const { createClient } = require('@supabase/supabase-js');

// ─── Config ──────────────────────────────────────────────────────────────────
const SUPABASE_URL        = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY= process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_API_KEY      = process.env.GOOGLE_PLACES_API_KEY;
const BATCH_SIZE          = parseInt(process.env.BATCH_SIZE  || '20',  10);
const MAX_PHOTOS          = parseInt(process.env.MAX_PHOTOS  || '5',   10);
const DRY_RUN             = process.env.DRY_RUN === 'true';
const STORAGE_BUCKET      = 'place-images';
const DELAY_MS            = 200; // polite delay between API calls

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}
if (!GOOGLE_API_KEY) {
  console.error('❌  Missing GOOGLE_PLACES_API_KEY in .env.local');
  console.error('    Get one at: https://console.cloud.google.com/ → APIs → Places API (New)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.json();
}

async function fetchBuffer(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  const arrayBuf = await res.arrayBuffer();
  return { buffer: Buffer.from(arrayBuf), contentType: res.headers.get('content-type') || 'image/jpeg' };
}

// ─── Ensure Storage Bucket Exists ────────────────────────────────────────────
async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(b => b.name === STORAGE_BUCKET);
  if (!exists) {
    console.log(`📦  Creating storage bucket: ${STORAGE_BUCKET}`);
    if (!DRY_RUN) {
      const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, { public: true });
      if (error) throw new Error(`Bucket creation failed: ${error.message}`);
    }
  } else {
    console.log(`✅  Bucket "${STORAGE_BUCKET}" already exists`);
  }
}

// ─── Get Places Needing Images ────────────────────────────────────────────────
async function getPlacesNeedingImages() {
  const CURSOR_FILE = "tmp/migration_cursor.json";
  let cursorId = "";
  if (fs.existsSync(CURSOR_FILE)) {
    try { cursorId = JSON.parse(fs.readFileSync(CURSOR_FILE, "utf8")).lastId || ""; } catch(e) {}
  }
  let query = supabase
    .from("Place")
    .select("id, name, latitude, longitude, city, type, slug")
    .eq("isActive", true)
    .eq("status", "APPROVED")
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("id", { ascending: true })
    .limit(BATCH_SIZE * 4);
  if (cursorId) query = query.gt("id", cursorId);
  const { data: places, error: e2 } = await query;
  if (e2) throw e2;
  if (!places || places.length === 0) {
    fs.writeFileSync(CURSOR_FILE, JSON.stringify({ lastId: "" }));
    console.log("All places scanned - cursor reset");
    return [];
  }
  const placeIds = places.map(p => p.id);
  const doneSet = new Set();
  for (let i = 0; i < placeIds.length; i += 50) {
    const chunk = placeIds.slice(i, i + 50);
    const { data: done } = await supabase.from("PlaceImage").select("placeId").eq("imageSource", "google_places").in("placeId", chunk);
    (done || []).forEach(r => doneSet.add(r.placeId));
  }
  let attempted = [];
  if (fs.existsSync(ATTEMPTED_FILE)) {
    try { attempted = JSON.parse(fs.readFileSync(ATTEMPTED_FILE, "utf8")); } catch(e) {}
  }
  const attemptedSet = new Set(attempted);
  const filtered = places.filter(p => !doneSet.has(p.id) && !attemptedSet.has(p.id)).slice(0, BATCH_SIZE);
  const lastId = places[places.length - 1].id;
  fs.writeFileSync(CURSOR_FILE, JSON.stringify({ lastId }));
 console.log("Found " + filtered.length + " places (cursor: " + (cursorId ? cursorId.slice(0,8)+"..." : "start") + ", raw fetch: " + places.length + ")");
  return filtered;
}

async function findGooglePlaceId(place) {
  const query = encodeURIComponent(`${place.name} ${place.city} Ethiopia`);
  const url = `https://places.googleapis.com/v1/places:searchText`;
  
  const body = {
    textQuery: `${place.name} ${place.city} Ethiopia`,
    locationBias: {
      circle: {
        center: { latitude: place.latitude, longitude: place.longitude },
        radius: 1000.0
      }
    },
    maxResultCount: 1,
    languageCode: 'en'
  };

  const data = await fetchJson(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.photos'
    },
    body: JSON.stringify(body)
  });

  if (!data.places || data.places.length === 0) return null;
  return data.places[0];
}

// Step 2: Get photo URLs from photo references
async function getPhotoUrl(photoName, maxWidth = 1600) {
  // photoName is like: "places/ChIJ.../photos/AXCi..."
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${GOOGLE_API_KEY}&skipHttpRedirect=false`;
  // This endpoint redirects to the actual image — we need to follow the redirect
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Photo fetch failed: ${res.status}`);
  const arrayBuf = await res.arrayBuffer();
  const contentType = res.headers.get('content-type') || 'image/jpeg';
  return { buffer: Buffer.from(arrayBuf), contentType, finalUrl: res.url };
}

// ─── Upload to Supabase Storage ───────────────────────────────────────────────
async function uploadPhoto(placeId, photoIndex, buffer, contentType) {
  const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
  const path = `${placeId}/${photoIndex}.${ext}`;
  
  if (DRY_RUN) {
    console.log(`  🔍  [DRY RUN] Would upload: ${path} (${(buffer.length / 1024).toFixed(1)} KB)`);
    return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
  }

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: true,
      cacheControl: '31536000' // 1 year
    });
  
  if (error) throw new Error(`Upload failed: ${error.message}`);
  
  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path);
  
  return publicUrl;
}

// ─── Insert PlaceImage Row ────────────────────────────────────────────────────
async function insertPlaceImage(placeId, publicUrl, priority, altText) {
  if (DRY_RUN) {
    console.log(`  🔍  [DRY RUN] Would insert PlaceImage: ${publicUrl}`);
    return;
  }

  const { error } = await supabase.from('PlaceImage').insert({
    id:            randomUUID(),
    placeId,
    imageUrl:       publicUrl,
    mirroredUrl:    publicUrl,
    imageSource:    'google_places',
    altText,
    priority,
    status:         'APPROVED',
    isMirrored:     true,
    qualityScore:   80,
    imageTruthType: 'place_real'
  });

  if (error) {
    // Duplicate — skip
    if (error.code === '23505') return;
    throw error;
  }
}

// ─── Process a Single Place ───────────────────────────────────────────────────
async function processPlace(place) {
  console.log(`\n🔎  ${place.name} (${place.type}, ${place.city})`);

  let googlePlace;
  try {
    googlePlace = await findGooglePlaceId(place);
    await sleep(DELAY_MS);
  } catch (err) {
    console.warn(`  ⚠️  Text search failed: ${err.message}`);
    saveAttempted(place.id);
  return { place: place.name, status: 'search_failed', photos: 0 };
  }

  if (!googlePlace) {
    console.log(`  ℹ️  Not found on Google Places — skipping`);
    saveAttempted(place.id);
  return { place: place.name, status: 'not_found', photos: 0 };
  }

  const photos = googlePlace.photos?.slice(0, MAX_PHOTOS) || [];
  if (photos.length === 0) {
    console.log(`  ℹ️  Found on Google but no photos available`);
    saveAttempted(place.id);
  return { place: place.name, status: 'no_photos', photos: 0 };
  }

  console.log(`  📸  Found ${photos.length} photo(s) → downloading...`);
  let uploaded = 0;

  for (let i = 0; i < photos.length; i++) {
    try {
      const { buffer, contentType } = await getPhotoUrl(photos[i].name);
      const publicUrl = await uploadPhoto(place.id, i, buffer, contentType);
      await insertPlaceImage(place.id, publicUrl, i, `${place.name} — photo ${i + 1}`);
      console.log(`  ✅  Photo ${i + 1}/${photos.length} uploaded (${(buffer.length / 1024).toFixed(1)} KB)`);
      uploaded++;
      await sleep(DELAY_MS);
    } catch (err) {
      console.warn(`  ⚠️  Photo ${i + 1} failed: ${err.message}`);
    }
  }

  if (uploaded === 0) saveAttempted(place.id);
  return { place: place.name, status: 'done', photos: uploaded };
}

// ─── Save Attempted Place IDs ─────────────────────────────────────────────────
function saveAttempted(placeId) {
  let ids = [];
  if (fs.existsSync(ATTEMPTED_FILE)) {
    try { ids = JSON.parse(fs.readFileSync(ATTEMPTED_FILE, 'utf8')); } catch {}
  }
  if (!ids.includes(placeId)) {
    ids.push(placeId);
    fs.writeFileSync(ATTEMPTED_FILE, JSON.stringify(ids));
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  AddisView — Google Places Image Migration Script    ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  if (DRY_RUN) console.log('\n⚠️  DRY RUN MODE — no writes will happen\n');

  await ensureBucket();

  const places = await getPlacesNeedingImages();
  if (places.length === 0) {
    console.log('\n🎉  All places already have images! Nothing to do.');
    return;
  }

  const results = [];
  for (const place of places) {
    const result = await processPlace(place);
    results.push(result);
    await sleep(DELAY_MS * 2);
  }

  // ─── Summary ───────────────────────────────────────────────────────────────
  console.log('\n\n══════════════════════ SUMMARY ══════════════════════');
  const done     = results.filter(r => r.status === 'done');
  const notFound = results.filter(r => r.status === 'not_found');
  const failed   = results.filter(r => r.status === 'search_failed');
  const noPhotos = results.filter(r => r.status === 'no_photos');
  const totalPhotos = results.reduce((sum, r) => sum + r.photos, 0);
  
  console.log(`✅  Processed:     ${done.length}/${results.length} places`);
  console.log(`📸  Photos saved:  ${totalPhotos}`);
  console.log(`❓  Not on Google: ${notFound.length}`);
  console.log(`📭  No photos:     ${noPhotos.length}`);
  console.log(`💥  Errors:        ${failed.length}`);
  if (failed.length > 0) {
    console.log(`\nFailed places:`);
    failed.forEach(r => console.log(`  - ${r.place}`));
  }
  console.log('\nRun again to continue with next batch.');
}

main().catch(err => {
  console.error('\n💥  Fatal error:', err);
  process.exit(1);
});
