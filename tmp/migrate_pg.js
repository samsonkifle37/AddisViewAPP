require('dotenv').config();
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function run() {
    await client.connect();
    console.log('Connected');

    await client.query(`ALTER TABLE "Place" ADD COLUMN IF NOT EXISTS "ownerId" TEXT;`);
    await client.query(`ALTER TABLE "Place" ADD COLUMN IF NOT EXISTS "claimedAt" TIMESTAMP(3);`);
    console.log('Altered Place');

    // Make renaming safe
    try { await client.query(`ALTER TABLE "OwnerClaim" RENAME COLUMN "contactName" TO "fullName";`); } catch(e){}
    try { await client.query(`ALTER TABLE "OwnerClaim" RENAME COLUMN "contactEmail" TO "email";`); } catch(e){}
    try { await client.query(`ALTER TABLE "OwnerClaim" RENAME COLUMN "contactPhone" TO "phone";`); } catch(e){}

    await client.query(`ALTER TABLE "OwnerClaim" ADD COLUMN IF NOT EXISTS "userId" TEXT;`);
    await client.query(`ALTER TABLE "OwnerClaim" ADD COLUMN IF NOT EXISTS "relationship" TEXT DEFAULT 'owner';`);
    await client.query(`ALTER TABLE "OwnerClaim" ADD COLUMN IF NOT EXISTS "proofNote" TEXT;`);
    await client.query(`ALTER TABLE "OwnerClaim" ADD COLUMN IF NOT EXISTS "submittedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;`);
    await client.query(`ALTER TABLE "OwnerClaim" ADD COLUMN IF NOT EXISTS "resolvedAt" TIMESTAMP(3);`);
    console.log('Altered OwnerClaim');

    await client.end();
}

run().catch(console.error);
