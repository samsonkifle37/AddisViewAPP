const { Pool } = require('pg');
require('dotenv').config();

async function main() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    const res = await pool.query(`
        SELECT id, name, slug 
        FROM "Place" 
        WHERE name ILIKE '%Entoto Natural Park%' 
           OR name ILIKE '%Sheger Riverside%' 
           OR name ILIKE '%Friendship Park%' 
           OR name ILIKE '%Addis Ababa Museum%'
           OR name ILIKE '%Africa Hall%'
    `);
    console.log(JSON.stringify(res.rows, null, 2));
    await pool.end();
}

main().catch(console.error);
