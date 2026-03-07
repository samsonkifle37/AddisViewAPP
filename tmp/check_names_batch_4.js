const { Pool } = require('pg');
require('dotenv').config();

async function main() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    const items = [
        "Addis City Highlights Tour",
        "Merkato Market Tour",
        "Coffee Ceremony Experience",
        "Entoto Mountain Tour",
        "Addis Food Tour",
        "Historical Addis Walking Tour",
        "Unity Park Guided Tour",
        "Addis Nightlife Tour",
        "Ride Ethiopia",
        "Feres Ride"
    ];

    const conditions = items.map(name => `name ILIKE '%${name.replace(/'/g, "''")}%'`).join(' OR ');

    const res = await pool.query(`
        SELECT id, name, slug 
        FROM "Place" 
        WHERE ${conditions}
    `);
    console.log(JSON.stringify(res.rows, null, 2));
    await pool.end();
}

main().catch(console.error);
