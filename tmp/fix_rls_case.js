const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.hrbxtdzpseitkegkeknt:addisview2026@aws-1-eu-central-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log('Connected to DB');

  // Check actual status values first
  const checkResult = await client.query(`
    SELECT status, COUNT(*) as cnt FROM "Place" GROUP BY status ORDER BY cnt DESC
  `);
  console.log('Place status values:', checkResult.rows);

  const imgCheckResult = await client.query(`
    SELECT status, COUNT(*) as cnt FROM "PlaceImage" GROUP BY status ORDER BY cnt DESC LIMIT 5
  `);
  console.log('PlaceImage status values:', imgCheckResult.rows);

  // Fix the RLS policies
  await client.query(`
    ALTER POLICY "Public read active approved places" ON "Place"
      USING ("isActive" = true AND status = 'APPROVED')
  `);
  console.log('Fixed Place policy');

  await client.query(`
    ALTER POLICY "Public read approved images" ON "PlaceImage"
      USING (status = 'APPROVED')
  `);
  console.log('Fixed PlaceImage policy');

  await client.end();
  console.log('Done!');
}

main().catch(e => { console.error(e.message); process.exit(1); });
