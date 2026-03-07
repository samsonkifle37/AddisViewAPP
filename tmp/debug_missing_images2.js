const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const places = await prisma.place.findMany({
        where: {
            type: { in: ['hotel', 'tour_operator'] }
        },
        include: {
            images: true
        },
        take: 5
    });

    const audits = await prisma.imageAudit.findMany({
        where: {
            entityId: { in: places.map(p => p.id) }
        }
    });

    fs.writeFileSync('tmp/image_debug2.json', JSON.stringify({ places, audits }, null, 2), 'utf-8');
}

main().finally(() => {
    prisma.$disconnect();
    pool.end();
});
