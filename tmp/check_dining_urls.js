const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function checkDiningImages() {
    const pg = new Client({ connectionString: process.env.DATABASE_URL });
    await pg.connect();

    try {
        const res = await pg.query(`
            SELECT p.id, p.name, pi."imageUrl"
            FROM "Place" p
            LEFT JOIN "PlaceImage" pi ON p.id = pi."placeId"
            WHERE p.type IN ('restaurant', 'club')
        `);

        for (const row of res.rows) {
            if (!row.imageUrl) {
                console.log(`[NO IMAGE] ${row.name}`);
            } else if (row.imageUrl.includes('unsplash') || row.imageUrl.includes('wikimedia') || !row.imageUrl.startsWith('http')) {
                console.log(`[WARNING IMAGE] ${row.name} - ${row.imageUrl}`);
            }
        }
    } finally {
        await pg.end();
    }
}

checkDiningImages();
