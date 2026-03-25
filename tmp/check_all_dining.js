const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function run() {
    const pg = new Client({ connectionString: process.env.DATABASE_URL });
    await pg.connect();

    try {
        const types = ['restaurant', 'club'];
        const res = await pg.query(`
            SELECT p.id, p.name, pi."imageUrl"
            FROM "Place" p
            LEFT JOIN "PlaceImage" pi ON p.id = pi."placeId"
            WHERE p.type = ANY($1::text[])
        `, [types]);

        res.rows.forEach(r => {
            console.log(`${r.name} - Image URL: ${r.imageUrl || 'MISSING'}`);
        });

    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await pg.end();
    }
}

run();
