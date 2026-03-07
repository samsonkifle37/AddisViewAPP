const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

async function main() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    const res = await pool.query('SELECT count(*) FROM "PlaceImage" WHERE "imageSource" IS NOT NULL');
    console.log('Count:', res.rows[0].count);
    await pool.end();
}

main();
