require('dotenv').config({ path: 'H:/AddisView/.env.local' });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  // Total google_places photos
  const { count: photoCount } = await sb.from('PlaceImage').select('*', { count: 'exact', head: true }).eq('imageSource', 'google_places');

  // Count unique places with google_places images via pagination
  let allPlaceIds = new Set();
  let page = 0;
  const PAGE_SIZE = 1000;
  while (true) {
    const { data, error } = await sb.from('PlaceImage')
      .select('placeId')
      .eq('imageSource', 'google_places')
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
    if (error || !data || data.length === 0) break;
    data.forEach(r => allPlaceIds.add(r.placeId));
    if (data.length < PAGE_SIZE) break;
    page++;
  }
  const uniquePlaces = allPlaceIds.size;

  // Total active approved places
  const { count: total } = await sb.from('Place').select('*', { count: 'exact', head: true })
    .eq('isActive', true).eq('status', 'APPROVED').not('latitude', 'is', null);

  const remaining = total - uniquePlaces;
  console.log('Photos uploaded:', photoCount);
  console.log(`Places covered: ${uniquePlaces} / ${total}`);
  console.log('Remaining:', remaining);
}

main().catch(console.error);
