const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function fix() {
    console.log("Cleaning up Habesha variations");
    // Just delete the extra ones instead of merging
    const slugs = ['habesha-2000', 'habesha-2000-1', 'habesha-2000-2', 'habesha-2000-5', 'habesha-2000-9', 'habesha-2000-10'];
    const p = await prisma.place.deleteMany({
        where: { slug: { in: slugs } }
    });
    console.log(`Deleted ${p.count} extra habesha properties`);
}
fix().finally(() => {
    prisma.$disconnect();
    pool.end();
});
