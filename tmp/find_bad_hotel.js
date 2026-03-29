require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  // Find hotels whose names start with "Ome"
  const { data: places } = await sb.from('Place')
    .select('id, name, type, slug')
    .eq('isActive', true).eq('status', 'APPROVED')
    .ilike('name', 'Ome%')
    .eq('type', 'hotel');

  console.log('Hotels starting with "Ome":');
  console.log(JSON.stringify(places, null, 2));

  // Also search more broadly
  const { data: places2 } = await sb.from('Place')
    .select('id, name, type, slug')
    .eq('isActive', true).eq('status', 'APPROVED')
    .ilike('name', '%ome%')
    .in('type', ['hotel', 'guesthouse', 'resort', 'apartment']);

  console.log('\nAll stays with "ome" in name:');
  console.log(JSON.stringify(places2, null, 2));

  // Check their images - find any that might have colosseum/rome images
  // by looking for image URLs from places with suspicious names
  if (places && places.length > 0) {
    for (const p of places) {
      const { data: imgs } = await sb.from('PlaceImage')
        .select('id, imageUrl, imageSource, priority')
        .eq('placeId', p.id)
        .order('priority');
      console.log(`\nImages for ${p.name} (${p.id}):`);
      imgs?.forEach(img => console.log(`  priority ${img.priority}: ${img.imageUrl}`));
    }
  }
}

main().catch(console.error);
