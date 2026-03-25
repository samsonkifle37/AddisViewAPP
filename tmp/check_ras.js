const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
    console.log("Checking Ras Hotel 3");
    const ras = await prisma.place.findFirst({ where: { slug: 'ras-hotel-3' } });
    if (ras) {
        const imgs = await prisma.placeImage.findMany({ where: { placeId: ras.id } });
        console.log("Images:", imgs);
    } else {
        console.log("Not found.");
    }
}
check().finally(() => {
    prisma.$disconnect();
    pool.end();
});
