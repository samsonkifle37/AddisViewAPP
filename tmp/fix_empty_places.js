const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'H:/AddisView/.env.local' });
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const fs = require('fs');

const TYPE_HINTS = {
  restaurant: 'restaurant', cafe: 'cafe', bar: 'bar',
  hotel: 'hotel', guesthouse: 'guesthouse', apartment: 'apartment', resort: 'resort',
  museum: 'museum', park: 'park', market: 'market', mall: 'shopping mall',
  attraction: 'attraction', gallery: 'gallery', gym: 'gym', spa: 'spa',
  hospital: 'hospital', clinic: 'clinic', pharmacy: 'pharmacy',
  school: 'school', university: 'university', church: 'church', mosque: 'mosque',
  cinema: 'cinema', theater: 'theater', stadium: 'stadium',
};

async function getAllPlaces() {
  let all = [], page = 0, PAGE = 1000;
  while (true) {
    const { data } = await s.from('Place').select('id,name,type').eq('status','APPROVED').range(page*PAGE,(page+1)*PAGE-1);
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE) break;
    page++;
  }
  return all;
}

async function getCoveredIds() {
  const ids = new Set();
  let page = 0, PAGE = 1000;
  while (true) {
    const { data } = await s.from('PlaceImage').select('placeId').range(page*PAGE,(page+1)*PAGE-1);
    if (!data || data.length === 0) break;
    data.forEach(r => ids.add(r.placeId));
    if (data.length < PAGE) break;
    page++;
  }
  return ids;
}

async function searchGoogle(query) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.photos'
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 1 })
  });
  const json = await res.json();
  return json.places?.[0] || null;
}

async function fetchPhotoUrl(photoName) {
  const res = await fetch(
    `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=1600&skipHttpRedirect=true`,
    { headers: { 'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY } }
  );
  const json = await res.json();
  return json.photoUri || null;
}

async function uploadToSupabase(placeId, photoId, url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  const buf = await res.arrayBuffer();
  const path = `places/${placeId}/${photoId}.jpg`;
  const { error } = await s.storage.from('place-images').upload(path, buf, {
    contentType: 'image/jpeg', upsert: true
  });
  if (error) return null;
  const { data } = s.storage.from('place-images').getPublicUrl(path);
  return data.publicUrl;
}

async function fixPlace(place, index, total) {
  const typeHint = TYPE_HINTS[place.type] || place.type || 'place';
  const query = `${place.name} ${typeHint} Addis Ababa Ethiopia`;
  process.stdout.write(`[${index}/${total}] ${place.name}\n  ?? "${query}"\n`);

  let result = await searchGoogle(query);
  let isExact = true;
  
  // Fallback broad queries if not found or no photos
  if (!result || !result.photos?.length) {
    const fallbacks = [
      `${place.name} Addis Ababa`,
      `${place.name} Ethiopia`,
      `${typeHint} Bole Addis Ababa Ethiopia`,
      `${typeHint} Kazanchis Addis Ababa Ethiopia`,
      `popular ${typeHint} Addis Ababa Ethiopia`,
    ];
    for (const fb of fallbacks) {
      result = await searchGoogle(fb);
      if (result?.photos?.length) { isExact = false; break; }
    }
  }

  if (!result?.photos?.length) {
    console.log(`  ??  No photos found`);
    return false;
  }

  const name = result.displayName?.text || place.name;
  const photosToFetch = result.photos.slice(0, isExact ? 5 : 3);
  console.log(`  ?? "${name}" — ${photosToFetch.length} photos (${isExact ? 'exact' : 'representative'})`);

  const records = [];
  for (let i = 0; i < photosToFetch.length; i++) {
    const photoUrl = await fetchPhotoUrl(photosToFetch[i].name);
    if (!photoUrl) continue;
    const photoId = photosToFetch[i].name.split('/').pop();
    const mirroredUrl = await uploadToSupabase(place.id, photoId, photoUrl);
    if (!mirroredUrl) continue;
    records.push({
      placeId: place.id,
      imageUrl: photoUrl,
      mirroredUrl,
      imageSource: 'google_places',
      imageTruthType: isExact ? 'place_real' : 'representative',
      priority: i === 0 ? 0 : i,
      qualityScore: 80,
      isMirrored: true,
      altText: `${place.name} - ${typeHint} in Addis Ababa`,
      status: 'active'
    });
  }

  if (records.length === 0) { console.log(`  ? Upload failed`); return false; }

  const { error } = await s.from('PlaceImage').insert(records);
  if (error) { console.log(`  ? DB insert error:`, error.message); return false; }
  console.log(`  ? ${records.length} images saved`);
  return true;
}

(async () => {
  const [places, coveredIds] = await Promise.all([getAllPlaces(), getCoveredIds()]);
  const needsFix = places.filter(p => !coveredIds.has(p.id));
  console.log(`\n?? Fixing ${needsFix.length} places with no images\n`);

  let fixed = 0, failed = 0;
  for (let i = 0; i < needsFix.length; i++) {
    const ok = await fixPlace(needsFix[i], i + 1, needsFix.length);
    if (ok) fixed++; else failed++;
    await new Promise(r => setTimeout(r, 300));
  }
  console.log(`\n? Done — ${fixed} fixed, ${failed} could not get photos`);
})();
