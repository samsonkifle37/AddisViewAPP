const { Pool } = require('pg');
require('dotenv').config();

async function main() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const res = await pool.query('SELECT name FROM "ImageAudit" WHERE status IN (\'missing\', \'pending\')');
        console.log(`Total missing: ${res.rows.length}`);
        console.log(JSON.stringify(res.rows.map(r => r.name), null, 2));
    } finally {
        await pool.end();
    }
}

main().catch(console.error);
