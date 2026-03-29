require('dotenv').config({ path: 'H:/AddisView/.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function fetchAllPlaces() {
  const all = [];
  let page = 0;
  while (true) {
    const { data } = await sb.from('Place')
      .select('id, name, type, latitude, longitude')
      .eq('isActive', true).eq('status', 'APPROVED')
      .order('id').range(page * 1000, (page + 1) * 1000 - 1);
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < 1000) break;
    page++;
  }
  return all;
}

async function fetchAllImages() {
  const imageMap = {};
  let page = 0;
  while (true) {
    const { data } = await sb.from('PlaceImage')
      .select('placeId, imageSource, priority')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (!data || data.length === 0) break;
    for (const img of data) {
      if (!imageMap[img.placeId]) imageMap[img.placeId] = [];
      imageMap[img.placeId].push(img);
    }
    if (data.length < 1000) break;
    page++;
  }
  return imageMap;
}

async function main() {
  console.log('Fetching all places...');
  const allPlaces = await fetchAllPlaces();
  console.log('Total active places:', allPlaces.length);

  console.log('Fetching all images...');
  const imageMap = await fetchAllImages();
  console.log('Places with images:', Object.keys(imageMap).length);

  const noImages = [], wikimediaOnly = [], unsplashOnly = [], mixedBad = [], hasGoogle = [];

  for (const place of allPlaces) {
    const imgs = (imageMap[place.id] || []).sort((a, b) => a.priority - b.priority);
    if (imgs.length === 0) { noImages.push(place); continue; }
    const sources = new Set(imgs.map(i => i.imageSource));
    if (sources.has('google_places')) { hasGoogle.push(place); continue; }
    if ([...sources].every(s => s === 'wikimedia')) wikimediaOnly.push(place);
    else if ([...sources].every(s => s === 'unsplash_fallback')) unsplashOnly.push(place);
    else mixedBad.push(place);
  }

  const needsFix = [...noImages, ...wikimediaOnly, ...unsplashOnly, ...mixedBad];
  const nullLatLon = needsFix.filter(p => p.latitude === null);
  const hasLatLon  = needsFix.filter(p => p.latitude !== null);

  console.log('\n=== FULL BREAKDOWN ===');
  console.log('✅ Has google_places images:', hasGoogle.length);
  console.log('❌ No images at all:        ', noImages.length);
  console.log('⚠️  Wikimedia only:          ', wikimediaOnly.length);
  console.log('⚠️  Unsplash fallback only:  ', unsplashOnly.length);
  console.log('⚠️  Mixed non-google:        ', mixedBad.length);
  console.log('──────────────────────────────');
  console.log('🔧 Total needing fix:        ', needsFix.length);
  console.log('   - null lat/lon:           ', nullLatLon.length);
  console.log('   - has lat/lon (retry):    ', hasLatLon.length);

  // Type breakdown of needing fix
  const byType = {};
  for (const p of needsFix) byType[p.type] = (byType[p.type] || 0) + 1;
  console.log('\nBy type:', JSON.stringify(byType, null, 2));

  fs.writeFileSync('H:/AddisView/tmp/places_needing_images.json', JSON.stringify(needsFix, null, 2));
  console.log('\nWrote', needsFix.length, 'places to places_needing_images.json');
}
main().catch(console.error);
