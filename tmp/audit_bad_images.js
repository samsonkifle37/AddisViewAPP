require('dotenv').config({ path: 'H:/AddisView/.env.local' });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  // Get all active approved places
  const { data: allPlaces } = await sb.from('Place')
    .select('id, name, type, latitude, longitude')
    .eq('isActive', true).eq('status', 'APPROVED')
    .order('name');

  console.log('Total active places:', allPlaces.length);

  // Get all PlaceImages grouped by placeId — fetch in pages
  const imageMap = {};
  let page = 0;
  while (true) {
    const { data: imgs } = await sb.from('PlaceImage')
      .select('placeId, imageSource, imageTruthType, priority')
      .range(page * 1000, (page + 1) * 1000 - 1)
      .order('placeId').order('priority');
    if (!imgs || imgs.length === 0) break;
    for (const img of imgs) {
      if (!imageMap[img.placeId]) imageMap[img.placeId] = [];
      imageMap[img.placeId].push(img);
    }
    if (imgs.length < 1000) break;
    page++;
  }
  console.log('Places with any image:', Object.keys(imageMap).length);

  // Categorise each place
  const noImages = [];
  const hasGooglePlaces = [];
  const wikimediaOnly = [];
  const unsplashOnly = [];
  const mixedBad = []; // has images but hero is not google_places

  for (const place of allPlaces) {
    const imgs = imageMap[place.id] || [];
    if (imgs.length === 0) {
      noImages.push(place);
      continue;
    }
    const hero = imgs.sort((a, b) => a.priority - b.priority)[0];
    const sources = new Set(imgs.map(i => i.imageSource));
    if (sources.has('google_places')) {
      hasGooglePlaces.push(place);
    } else if ([...sources].every(s => s === 'wikimedia')) {
      wikimediaOnly.push({ ...place, heroSource: hero.imageSource });
    } else if ([...sources].every(s => s === 'unsplash_fallback')) {
      unsplashOnly.push({ ...place, heroSource: hero.imageSource });
    } else {
      mixedBad.push({ ...place, heroSource: hero.imageSource, sources: [...sources].join('+') });
    }
  }

  console.log('\n=== BREAKDOWN ===');
  console.log('✅ Has google_places images:', hasGooglePlaces.length);
  console.log('❌ No images at all:', noImages.length);
  console.log('⚠️  Wikimedia only:', wikimediaOnly.length);
  console.log('⚠️  Unsplash fallback only:', unsplashOnly.length);
  console.log('⚠️  Mixed non-google:', mixedBad.length);

  const needsFix = [...wikimediaOnly, ...unsplashOnly, ...mixedBad, ...noImages];
  console.log('\n🔧 Total needing new images:', needsFix.length);

  // Show lat/lon breakdown for needing fix
  const nullLatLon = needsFix.filter(p => p.latitude === null);
  const hasLatLon = needsFix.filter(p => p.latitude !== null);
  console.log('  - null lat/lon (name-search needed):', nullLatLon.length);
  console.log('  - has lat/lon (should retry google):', hasLatLon.length);

  // Write fixable list to file
  const fs = require('fs');
  fs.writeFileSync('H:/AddisView/tmp/places_needing_images.json', JSON.stringify(needsFix, null, 2));
  console.log('\nWrote list to tmp/places_needing_images.json');

  // Show sample of each category
  if (wikimediaOnly.length > 0) {
    console.log('\nSample wikimedia-only places:');
    wikimediaOnly.slice(0, 5).forEach(p => console.log(' -', p.name, `(${p.type})`));
  }
  if (unsplashOnly.length > 0) {
    console.log('\nSample unsplash-only places:');
    unsplashOnly.slice(0, 5).forEach(p => console.log(' -', p.name, `(${p.type})`));
  }
  if (noImages.length > 0) {
    console.log('\nSample no-image places:');
    noImages.slice(0, 5).forEach(p => console.log(' -', p.name, `(${p.type})`));
  }
}
main().catch(console.error);
