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
        include: { images: true }
    });

    const missingImages = places.filter(p => !p.images || p.images.length === 0).map(p => p.name);
    const missingContact = places.filter(p => !p.phone && !p.email && !p.websiteUrl && !p.bookingUrl && !p.googleMapsUrl).map(p => p.name);

    console.log("Still missing verified primary images:", missingImages.slice(0, 10), "...", missingImages.length, "total");
    console.log("Still missing ALL contact data:", missingContact.slice(0, 10), "...", missingContact.length, "total");
}

main().finally(() => {
    prisma.$disconnect();
    pool.end();
});
