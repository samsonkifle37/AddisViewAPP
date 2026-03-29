require('dotenv').config({ path: 'H:/AddisView/.env.local' });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: place } = await sb.from('Place').select('id, name, slug').eq('slug', 'merkato-market').single();
  console.log('Place:', place?.name, place?.id);

  const { data: imgs } = await sb.from('PlaceImage')
    .select('id, imageUrl, mirroredUrl, imageSource, priority, qualityScore, altText')
    .eq('placeId', place.id)
    .order('priority');

  console.log(`\nImages (${imgs?.length}):`);
  imgs?.forEach((img, i) => {
    console.log(`\n[${i}] priority=${img.priority} score=${img.qualityScore}`);
    console.log(`    source: ${img.imageSource}`);
    console.log(`    url: ${img.imageUrl}`);
  });
}
main().catch(console.error);
