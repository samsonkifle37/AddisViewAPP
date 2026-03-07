const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
pool.query("SELECT * FROM information_schema.columns WHERE table_name = 'Place';").then(res => {
    console.log(res.rows.map(r => r.column_name));
    pool.end();
}).catch(e => console.error(e));
