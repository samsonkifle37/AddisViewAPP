const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function run() {
    const pg = new Client({ connectionString: process.env.DATABASE_URL });
    await pg.connect();

    try {
        const res = await pg.query(`
            SELECT pi."imageUrl", p.name
            FROM "PlaceImage" pi
            JOIN "Place" p ON pi."placeId" = p.id
            WHERE p.type = 'hotel' OR p.type = 'resort' OR p.type = 'apartment'
            LIMIT 10
        `);

        console.log("Existing Hotel images:");
        res.rows.forEach(r => console.log(`${r.name}: ${r.imageUrl}`));

    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await pg.end();
    }
}

run();
