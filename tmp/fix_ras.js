const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function fix() {
    const kuriftu = await prisma.place.findFirst({ where: { slug: 'kuriftu-resort-bishoftu-8' } });
    if(kuriftu) {
        const dupes = await prisma.placeImage.findMany({
            where: {
                imageUrl: { contains: 'Kuriftu_Resort' },
                placeId: { not: kuriftu.id }
            }
        });
        console.log(`Found ${dupes.length} dupes.`);
        for (const d of dupes) {
            console.log("Dupe URL:", d.imageUrl);
            await prisma.placeImage.update({
                where: { id: d.id },
                data: { imageUrl: '/fallbacks/hotel.png', imageSource: 'fallback-category' }
            });
        }
        console.log(`Updated ${dupes.length} images.`);
    }
}
fix().finally(() => {
    prisma.$disconnect();
    pool.end();
});
