const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

async function main() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    const res = await pool.query("SELECT id, name FROM \"Place\" WHERE name ILIKE '%Holy Trinity%'");
    console.log(res.rows);
    await pool.end();
}

main();
