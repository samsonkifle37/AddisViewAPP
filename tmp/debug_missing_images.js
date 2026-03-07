const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const places = await prisma.place.findMany({
        where: {
            name: {
                in: ['Bole Ambassador Hotel', 'Green Land Tours Ethiopia']
            }
        },
        include: {
            images: true
        }
    });

    const audits = await prisma.imageAudit.findMany({
        where: {
            entityId: { in: places.map(p => p.id) }
        }
    });

    console.log(JSON.stringify({ places, audits }, null, 2));
}

main().finally(() => {
    prisma.$disconnect();
    pool.end();
});
