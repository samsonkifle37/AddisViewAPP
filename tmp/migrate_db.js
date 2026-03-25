const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
    try {
        await pool.query(`ALTER TABLE "PlaceImage" ADD COLUMN "imageTruthType" TEXT NOT NULL DEFAULT 'place_real';`);
        console.log("Schema updated directly in Postgres.");
    } catch(e) {
        if(e.code === '42701') console.log("Column already exists.");
        else console.error(e);
    }
    pool.end();
}
run();
