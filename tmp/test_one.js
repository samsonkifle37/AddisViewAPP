const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    // Testing Holy Trinity (it was the first one)
    const url = "https://media-cdn.tripadvisor.com/media/photo-o/10/a3/9a/99/kategna-restaurant.jpg";
    console.log(`Testing URL: ${url}`);

    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'AddisViewImageValidator/1.0 (contact: admin@addisview.app)',
                'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
                'Referer': 'https://addisview.vercel.app'
            }
        });
        console.log(`Success! Status: ${response.status}, Size: ${response.data.length} bytes`);
    } catch (e) {
        console.error(`Failed! Error: ${e.message}`);
        if (e.response) {
            console.error(`Status: ${e.response.status}`);
        }
    } finally {
        await pool.end();
    }
}

main();
