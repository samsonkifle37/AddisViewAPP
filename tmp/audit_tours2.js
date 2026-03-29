require('dotenv').config({ path: 'H:/AddisView/.env.local' });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: tours } = await sb.from('Place')
    .select('id, name, type, latitude, longitude')
    .eq('isActive', true).eq('status', 'APPROVED').eq('type', 'tour');

  console.log('\nTOUR IMAGE DETAILS:');
  for (const t of tours || []) {
    const { data: imgs } = await sb.from('PlaceImage').select('imageUrl, imageSource, imageTruthType, mirroredUrl').eq('placeId', t.id).order('priority');
    const img = imgs && imgs[0];
    const url = img ? img.imageUrl : 'NO IMAGE';
    console.log(`${t.name}: source=${img?.imageSource}, truthType=${img?.imageTruthType}`);
    console.log(`  url: ${url}`);
    console.log(`  lat/lon: ${t.latitude}, ${t.longitude}`);
  }
}
main().catch(console.error);
