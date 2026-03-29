/**
 * Removes duplicate PlaceImage rows (same placeId + imageUrl) that were
 * inserted by the mistakenly-wide fallback run, keeping the earliest one.
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('Fetching all PlaceImage rows for stay-type places...');

  // Get all stay-type place IDs
  const { data: stays } = await sb.from('Place')
    .select('id').eq('isActive', true).eq('status', 'APPROVED')
    .in('type', ['hotel', 'guesthouse', 'apartment', 'resort']);
  const stayIds = new Set(stays.map(s => s.id));
  console.log(`Stay-type places: ${stayIds.size}`);

  // Fetch all their PlaceImages (paginated)
  const allImgs = [];
  let page = 0;
  while (true) {
    const { data } = await sb.from('PlaceImage')
      .select('id, placeId, imageUrl, imageSource, priority, createdAt')
      .in('placeId', [...stayIds])
      .range(page * 1000, (page + 1) * 1000 - 1)
      .order('createdAt', { ascending: true });
    if (!data || data.length === 0) break;
    allImgs.push(...data);
    if (data.length < 1000) break;
    page++;
  }
  console.log(`Total PlaceImage rows for stays: ${allImgs.length}`);

  // Find duplicates: same placeId + imageUrl
  const seen = new Map(); // key: placeId+url -> first row
  const toDelete = [];
  for (const img of allImgs) {
    const key = `${img.placeId}::${img.imageUrl}`;
    if (seen.has(key)) {
      toDelete.push(img.id);
    } else {
      seen.set(key, img);
    }
  }

  console.log(`Duplicate rows to delete: ${toDelete.length}`);

  if (toDelete.length === 0) {
    console.log('No duplicates found!');
    return;
  }

  // Delete in batches of 100
  let deleted = 0;
  for (let i = 0; i < toDelete.length; i += 100) {
    const batch = toDelete.slice(i, i + 100);
    const { error } = await sb.from('PlaceImage').delete().in('id', batch);
    if (error) console.log('Delete error:', error.message);
    else deleted += batch.length;
  }
  console.log(`✅ Deleted ${deleted} duplicate rows.`);
}

main().catch(console.error);
