const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function main() {
  // List existing buckets
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
  if (listErr) { console.error('List error:', listErr.message); process.exit(1); }
  
  console.log('Existing buckets:', buckets.map(b => b.name));
  
  const exists = buckets.some(b => b.name === 'place-images');
  if (exists) {
    console.log('✅ Bucket "place-images" already exists');
  } else {
    const { data, error } = await supabase.storage.createBucket('place-images', { public: true });
    if (error) { console.error('Create error:', error.message); process.exit(1); }
    console.log('✅ Created bucket "place-images" (public)');
  }
  
  // Test upload/download to confirm bucket works
  const testBuf = Buffer.from('test');
  const { error: uploadErr } = await supabase.storage
    .from('place-images')
    .upload('_test/ping.txt', testBuf, { upsert: true, contentType: 'text/plain' });
  if (uploadErr) { console.error('Upload test failed:', uploadErr.message); process.exit(1); }
  
  const { data: { publicUrl } } = supabase.storage.from('place-images').getPublicUrl('_test/ping.txt');
  console.log('✅ Bucket working. Public URL base:', publicUrl.split('_test')[0]);
  
  // Clean up test file
  await supabase.storage.from('place-images').remove(['_test/ping.txt']);
  console.log('Ready for migration!');
}

main().catch(e => { console.error(e.message); process.exit(1); });
