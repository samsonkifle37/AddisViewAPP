const { Pool } = require('pg');
require('dotenv').config();

async function main() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    const items = [
        "ZayRide",
        "PickPick Taxi",
        "Addis Airport Taxi",
        "ETT Tours Ethiopia",
        "Green Land Tours Ethiopia",
        "Ethio Travel and Tours",
        "Simien Eco Tours",
        "Travel Ethiopia"
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
