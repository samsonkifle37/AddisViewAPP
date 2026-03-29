require('dotenv').config({ path: 'H:/AddisView/.env.local' });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const PLACE_ID = '5985c0a2-ac20-4a0e-86c0-df5c199ce441';
  const { data: imgs } = await sb.from('PlaceImage')
    .select('id, imageUrl, priority')
    .eq('placeId', PLACE_ID)
    .order('priority');
  imgs?.forEach(img => console.log(`priority=${img.priority} | id=${img.id} | ${img.imageUrl}`));
}
main().catch(console.error);
