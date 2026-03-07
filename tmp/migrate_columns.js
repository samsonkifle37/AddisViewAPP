const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

// Use DATABASE_URL because it uses the 6543 PgBouncer which is accessible via IPv4
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function main() {
    try {
        await pool.query(`ALTER TABLE "Place" ADD COLUMN IF NOT EXISTS "whatsappLink" text;`);
        await pool.query(`ALTER TABLE "Place" ADD COLUMN IF NOT EXISTS "instagram" text;`);
        await pool.query(`ALTER TABLE "Place" ADD COLUMN IF NOT EXISTS "facebook" text;`);
        console.log("Columns added successfully");
    } catch (e) {
        console.error("Error executing alter table", e);
    } finally {
        pool.end();
    }
}

main();
