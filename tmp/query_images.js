const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const hotels = await prisma.place.findMany({ where: { type: 'hotel' }, include: { images: true }, take: 10 });
    const tours = await prisma.place.findMany({ where: { type: 'tour' }, include: { images: true }, take: 10 });
    fs.writeFileSync('tmp/image_data.json', JSON.stringify({ hotels, tours }, null, 2));
}

main().finally(() => {
    prisma.$disconnect();
    pool.end();
});
