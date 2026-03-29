require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const STAY_TYPES = ['hotel', 'guesthouse', 'apartment', 'resort'];

async function fetchAllStays() {
  const all = [];
  let page = 0;
  while (true) {
    const { data } = await sb.from('Place')
      .select('id, name, type, latitude, longitude')
      .eq('isActive', true).eq('status', 'APPROVED')
      .in('type', STAY_TYPES)
      .order('id').range(page * 1000, (page + 1) * 1000 - 1);
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < 1000) break;
    page++;
  }
  return all;
}

async function fetchAllImages() {
  const all = [];
  let page = 0;
  while (true) {
    const { data } = await sb.from('PlaceImage')
      .select('placeId, imageSource, imageUrl')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < 1000) break;
    page++;
  }
  return all;
}

async function main() {
  console.log('Fetching all stay-type places...');
  const stays = await fetchAllStays();
  console.log(`Total stay places: ${stays.length}`);

  console.log('Fetching all images...');
  const images = await fetchAllImages();

  // Group images by placeId
  const imgMap = {};
  for (const img of images) {
    if (!imgMap[img.placeId]) imgMap[img.placeId] = [];
    imgMap[img.placeId].push(img);
  }

  const noImages = [];
  const noGoogleImages = [];
  const hasGoogle = [];

  for (const stay of stays) {
    const imgs = imgMap[stay.id] || [];
    const googleImgs = imgs.filter(i => i.imageSource === 'google_places');
    const fallbackImgs = imgs.filter(i =>
      !i.imageSource || i.imageSource === 'unsplash' ||
      (i.imageUrl && (i.imageUrl.includes('/fallbacks/') || i.imageUrl.includes('unsplash.com')))
    );

    if (imgs.length === 0) {
      noImages.push(stay);
    } else if (googleImgs.length === 0) {
      noGoogleImages.push({ ...stay, sources: [...new Set(imgs.map(i => i.imageSource))] });
    } else {
      hasGoogle.push(stay);
    }
  }

  console.log('\n=== STAYS IMAGE AUDIT ===');
  console.log(`✅ Has google_places images: ${hasGoogle.length}`);
  console.log(`❌ No images at all:         ${noImages.length}`);
  console.log(`⚠️  Has images but no Google: ${noGoogleImages.length}`);
  console.log(`🔧 Total needing fix:         ${noImages.length + noGoogleImages.length}`);

  const needsFix = [
    ...noImages.map(s => ({ ...s, reason: 'no_images' })),
    ...noGoogleImages.map(s => ({ ...s, reason: 'no_google' })),
  ];

  fs.writeFileSync('tmp/stays_needing_images.json', JSON.stringify(needsFix, null, 2));
  console.log(`\nWrote ${needsFix.length} stays to stays_needing_images.json`);

  // Type breakdown
  const byType = {};
  for (const s of needsFix) {
    byType[s.type] = (byType[s.type] || 0) + 1;
  }
  console.log('By type:', JSON.stringify(byType, null, 2));
}

main().catch(console.error);
