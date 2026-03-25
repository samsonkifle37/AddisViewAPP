const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function removeFeres() {
    const pg = new Client({ connectionString: process.env.DATABASE_URL });
    await pg.connect();

    try {
        const res = await pg.query(`DELETE FROM "Place" WHERE name ILIKE '%Feres%' RETURNING id, name`);
        if (res.rows.length > 0) {
            console.log(`Deleted:`);
            res.rows.forEach(r => console.log(`  - [${r.id}] ${r.name}`));
        } else {
            console.log(`No entries found for Feres.`);
        }
    } catch (e) {
        console.error("Error deleting Feres:", e.message);
    } finally {
        await pg.end();
    }
}

removeFeres();
