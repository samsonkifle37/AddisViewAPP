const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'H:/AddisView/.env.local' });
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  const { count: c1 } = await s.from('PlaceImage').select('*', { count: 'exact', head: true }).ilike('imageUrl', '%maps.googleapis.com%');
  console.log('Old googleapis remaining:', c1);
  const { count: c2 } = await s.from('PlaceImage').select('*', { count: 'exact', head: true }).ilike('imageUrl', '%openstreetmap%');
  console.log('OSM remaining:', c2);
  const { count: c3 } = await s.from('PlaceImage').select('*', { count: 'exact', head: true });
  console.log('Total PlaceImage rows:', c3);
})();
