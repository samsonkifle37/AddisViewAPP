require('dotenv').config({ path: 'H:/AddisView/.env.local' });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: place } = await sb.from('Place')
    .select('id, name, slug, type, isActive, status, latitude, longitude')
    .eq('slug', 'merkato-market').single();
  console.log('Place details:', JSON.stringify(place, null, 2));
}
main().catch(console.error);
