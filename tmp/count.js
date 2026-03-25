const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function fix() {
    const placesCount = await prisma.place.count();
    console.log(`Total Places: ${placesCount}`);
}
fix().finally(() => {
    prisma.$disconnect();
    pool.end();
});
