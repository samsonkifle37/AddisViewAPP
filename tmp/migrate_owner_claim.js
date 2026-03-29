const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
    try {
        // Add OwnerClaim table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS "OwnerClaim" (
                "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
                "placeId" TEXT NOT NULL,
                "contactName" TEXT NOT NULL,
                "contactEmail" TEXT,
                "contactPhone" TEXT,
                "verificationCode" TEXT,
                "status" TEXT NOT NULL DEFAULT 'PENDING',
                "verifiedAt" TIMESTAMP(3),
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "OwnerClaim_pkey" PRIMARY KEY ("id")
            );
        `);
        console.log("OwnerClaim table created.");
        
        // Add ownerVerified to Place
        await pool.query(`ALTER TABLE "Place" ADD COLUMN IF NOT EXISTS "ownerVerified" BOOLEAN NOT NULL DEFAULT false;`);
        console.log("ownerVerified column added to Place.");

        // Add indexes
        await pool.query(`CREATE INDEX IF NOT EXISTS "OwnerClaim_placeId_idx" ON "OwnerClaim"("placeId");`);
        await pool.query(`CREATE INDEX IF NOT EXISTS "OwnerClaim_status_idx" ON "OwnerClaim"("status");`);
        console.log("Indexes created.");
        
    } catch(e) {
        if (e.code === '42701') console.log("Column already exists.");
        else console.error(e);
    }
    pool.end();
}
run();
