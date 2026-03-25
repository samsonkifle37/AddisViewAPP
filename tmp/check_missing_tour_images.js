const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function checkMissingImages() {
    const pg = new Client({ connectionString: process.env.DATABASE_URL });
    await pg.connect();

    try {
        const types = ['tour', 'park', 'market', 'coffee', 'museum', 'culture', 'nightlife', 'tour_operator'];
        const placeholders = types.map((_, i) => `$${i + 1}`).join(', ');

        const res = await pg.query(`
            SELECT p.id, p.name, p.type, p."websiteUrl" as website, p."bookingUrl" as booking
            FROM "Place" p
            LEFT JOIN "PlaceImage" pi ON p.id = pi."placeId"
            WHERE p.type = ANY($1::text[])
              AND pi.id IS NULL
        `, [types]);

        console.log(`Found ${res.rows.length} places missing images in Tour categories:`);
        res.rows.forEach(r => {
            console.log(`- ${r.name} (${r.type})`);
        });

    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await pg.end();
    }
}

checkMissingImages();
