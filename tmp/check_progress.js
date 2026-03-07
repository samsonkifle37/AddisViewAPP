const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

async function main() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const res = await pool.query('SELECT p.name, pi."imageUrl", pi."imageSource" FROM "Place" p JOIN "PlaceImage" pi ON p.id = pi."placeId" WHERE pi."imageSource" IS NOT NULL LIMIT 5');
        console.log(JSON.stringify(res.rows, null, 2));
    } finally {
        await pool.end();
    }
}

main().catch(console.error);
