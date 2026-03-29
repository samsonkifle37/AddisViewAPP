const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'H:/AddisView/.env.local' });
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
(async () => {
  // Check status values
  const { data: statuses } = await s.from('Place').select('status').limit(5);
  console.log('Sample statuses:', JSON.stringify(statuses));
  
  // Count all places
  const { count } = await s.from('Place').select('*', { count: 'exact', head: true });
  console.log('Total places (no filter):', count);
  
  // Check with 'published' status
  const { count: pub } = await s.from('Place').select('*', { count: 'exact', head: true }).eq('status','published');
  console.log('published:', pub);
  const { count: act } = await s.from('Place').select('*', { count: 'exact', head: true }).eq('status','active');
  console.log('active:', act);
})();
