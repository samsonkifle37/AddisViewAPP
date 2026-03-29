require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  // First, let's see the Stay table structure
  const { data: sample, error: sErr } = await sb
    .from('Stay')
    .select('*')
    .limit(3);

  if (sErr) {
    console.log('Stay table error:', sErr.message);
    // Try other table names
    const tables = ['Stays', 'Listing', 'Accommodation', 'Property'];
    for (const t of tables) {
      const { data, error } = await sb.from(t).select('*').limit(1);
      if (!error) console.log(`Found table: ${t}`, JSON.stringify(data[0], null, 2));
    }
    return;
  }

  console.log('Stay table sample:');
  console.log(JSON.stringify(sample[0], null, 2));
  console.log('\nKeys:', Object.keys(sample[0] || {}).join(', '));

  // Count total stays
  const { count } = await sb.from('Stay').select('*', { count: 'exact', head: true })
    .eq('isActive', true).eq('status', 'APPROVED');
  console.log(`\nTotal active/approved stays: ${count}`);

  // Check StayImage table
  const { data: imgSample, error: iErr } = await sb.from('StayImage').select('*').limit(3);
  if (iErr) {
    console.log('No StayImage table:', iErr.message);
  } else {
    console.log('\nStayImage sample:', JSON.stringify(imgSample[0], null, 2));
  }
}

main().catch(console.error);
