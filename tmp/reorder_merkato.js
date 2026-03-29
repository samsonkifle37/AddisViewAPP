require('dotenv').config({ path: 'H:/AddisView/.env.local' });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const PLACE_ID = '5985c0a2-ac20-4a0e-86c0-df5c199ce441';
  
  // IDs from earlier output
  // priority=0 (cars/street)   → id=c010cef9  → move to priority 4
  // priority=1 (spices - BEST) → id=e5bcd11f  → move to priority 0
  // priority=4 (old kettles)   → id=5ab9298e  → move to priority 1 (still near end)

  const updates = [
    { id: 'e5bcd11f-0b07-4b19-ac74-12c9eb5a6d54', priority: 0 },  // spices → hero
    { id: '93e9685d-2c81-49b8-9cf1-8656cbf4aea9', priority: 1 },  // mall interior
    { id: '56665783-450b-49ac-96d4-cf2881043025', priority: 2 },  // traditional dress
    { id: 'c010cef9-111d-4aa3-9ff8-894bf73518d4', priority: 3 },  // street/cars
    { id: '5ab9298e-1d74-4b89-aba1-be12e68bccf5', priority: 4 },  // old kettles
  ];

  for (const u of updates) {
    const { error } = await sb.from('PlaceImage').update({ priority: u.priority }).eq('id', u.id);
    if (error) console.log('Error updating', u.id, error.message);
    else console.log(`✅ Set priority=${u.priority} for ${u.id.slice(0,8)}...`);
  }
  console.log('\nDone — spices photo is now hero (priority 0)');
}
main().catch(console.error);
