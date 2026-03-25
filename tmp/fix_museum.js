const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function fix() {
    const museum = await prisma.place.findFirst({ where: { slug: 'addis-ababa-museum' } });
    if(museum) {
        const result = await prisma.placeImage.updateMany({
            where: {
                placeId: museum.id
            },
            data: { imageUrl: '/fallbacks/museum.png', imageSource: 'fallback-category' }
        });
        console.log(`Updated ${result.count} images for Addis Ababa Museum`);
    } else {
        console.log("Could not find Addis Ababa Museum!");
    }
}
fix().finally(() => {
    prisma.$disconnect();
    pool.end();
});
