require('dotenv').config({ path: 'H:/AddisView/.env.local' });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  // Get all tours
  const { data: tours, error } = await sb.from('Place')
    .select('id, name, type, city, slug')
    .eq('isActive', true)
    .eq('status', 'APPROVED')
    .eq('type', 'tour')
    .order('name');

  console.log('Total tours:', tours ? tours.length : 0);
  if (error) console.log('Error fetching tours:', error);

  if (!tours || tours.length === 0) {
    // Maybe tours use a different type value
    const { data: types } = await sb.from('Place').select('type').eq('isActive', true).eq('status', 'APPROVED');
    const typeSet = new Set((types || []).map(t => t.type));
    console.log('Available types:', [...typeSet].join(', '));
    return;
  }

  // Check what images each tour has
  for (const t of tours.slice(0, 6)) {
    const { data: imgs } = await sb.from('PlaceImage').select('imageUrl, imageSource, mirroredUrl').eq('placeId', t.id).limit(3);
    const sources = (imgs || []).map(i => i.imageSource).join(', ') || 'NONE';
    const url = imgs && imgs[0] ? imgs[0].imageUrl.slice(-40) : 'none';
    console.log(`${t.name} (${t.type}) | images: ${(imgs||[]).length} | sources: ${sources} | url: ...${url}`);
  }
}
main().catch(console.error);
