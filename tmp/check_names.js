const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const dbUrl = process.env.DATABASE_URL;

async function checkNames() {
    const pg = new Client({ connectionString: dbUrl });
    await pg.connect();

    const terms = ['ETT', 'Addis Food', 'Sabon', 'Entoto', 'Simien', 'Ethio Travel', 'Green Land', 'Nightlife', 'Walking', 'Merkato', 'Alem Bunna', 'Garden of Coffee', 'Atikilt', 'Afro', 'Abeal', 'Galani', 'Bale', 'Danakil', 'Lalibela'];

    for (const term of terms) {
        let res = await pg.query(`SELECT id, name FROM "Place" WHERE name ILIKE $1`, [`%${term}%`]);
        console.log(`\nSearch for '${term}':`);
        res.rows.forEach(r => console.log(`  - [${r.id}] ${r.name}`));
    }
    await pg.end();
}

checkNames();
