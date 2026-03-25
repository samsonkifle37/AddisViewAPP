const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function run() {
    const pg = new Client({ connectionString: process.env.DATABASE_URL });
    await pg.connect();

    try {
        const res = await pg.query(`
            SELECT "imageUrl", "altText"
            FROM "PlaceImage"
            ORDER BY "createdAt" DESC
            LIMIT 20
        `);

        console.log("Recent images:");
        res.rows.forEach(r => console.log(`${r.altText}: ${r.imageUrl}`));

    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await pg.end();
    }
}

run();
