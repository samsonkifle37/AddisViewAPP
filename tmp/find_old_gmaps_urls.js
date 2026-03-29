require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('Scanning for old maps.googleapis.com image URLs...');
  
  const all = [];
  let page = 0;
  while (true) {
    const { data } = await sb.from('PlaceImage')
      .select('id, placeId, imageUrl, imageSource, priority')
      .ilike('imageUrl', '%maps.googleapis.com%')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < 1000) break;
    page++;
  }

  console.log(`Found ${all.length} records with old maps.googleapis.com URLs\n`);

  // Also check for openstreetmap logos (these were mistakenly set as place images)
  const osm = [];
  page = 0;
  while (true) {
    const { data } = await sb.from('PlaceImage')
      .select('id, placeId, imageUrl')
      .ilike('imageUrl', '%openstreetmap%')
      .range(page * 1000, (page + 1) * 1000 - 1);
    if (!data || data.length === 0) break;
    osm.push(...data);
    if (data.length < 1000) break;
    page++;
  }
  console.log(`Found ${osm.length} records with openstreetmap URLs\n`);

  if (all.length > 0) {
    // Get place names for these
    const placeIds = [...new Set(all.map(r => r.placeId))];
    const { data: places } = await sb.from('Place')
      .select('id, name, type, slug')
      .in('id', placeIds);
    const placeMap = {};
    places?.forEach(p => placeMap[p.id] = p);

    console.log('Places with old maps.googleapis.com images:');
    for (const pid of placeIds) {
      const p = placeMap[pid];
      const imgs = all.filter(i => i.placeId === pid);
      console.log(`  ${p?.name || pid} (${p?.type}) — ${imgs.length} old URL(s)`);
    }
  }

  if (osm.length > 0) {
    const placeIds = [...new Set(osm.map(r => r.placeId))];
    const { data: places } = await sb.from('Place')
      .select('id, name, type')
      .in('id', placeIds);
    const placeMap = {};
    places?.forEach(p => placeMap[p.id] = p);
    console.log('\nPlaces with openstreetmap logo as image:');
    for (const pid of placeIds) {
      console.log(`  ${placeMap[pid]?.name || pid}`);
    }

    // Delete these - OSM logo is never a valid place image
    console.log('\nDeleting all openstreetmap logo images...');
    const ids = osm.map(r => r.id);
    for (let i = 0; i < ids.length; i += 100) {
      await sb.from('PlaceImage').delete().in('id', ids.slice(i, i + 100));
    }
    console.log(`✅ Deleted ${ids.length} OSM logo records`);
  }
}

main().catch(console.error);
