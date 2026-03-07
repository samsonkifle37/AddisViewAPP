const { Pool } = require('pg');
require('dotenv').config();

async function main() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    const client = await pool.connect();
    try {
        const names = [
            'Holy Trinity Cathedral',
            'Unity Park',
            'Menelik II Palace',
            'Red Terror Martyrs Memorial Museum',
            'Ethnological Museum (Addis Ababa University)'
        ];
        const res = await client.query(
            'SELECT id, name, slug FROM "Place" WHERE name = ANY($1)',
            [names]
        );
        console.log(JSON.stringify(res.rows, null, 2));
    } finally {
        client.release();
        await pool.end();
    }
}

main().catch(console.error);
