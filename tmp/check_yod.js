const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function checkNames() {
    const pg = new Client({ connectionString: process.env.DATABASE_URL });
    await pg.connect();

    const terms = ['Yod Abyssinia'];

    for (const term of terms) {
        let res = await pg.query(`SELECT id, name FROM "Place" WHERE name ILIKE $1`, [`%${term}%`]);
        console.log(`\nSearch for '${term}':`);
        res.rows.forEach(r => console.log(`  - [${r.id}] ${r.name}`));
    }
    await pg.end();
}

checkNames();
