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
    const targetNames = [
        'Bole Ambassador Hotel',
        'Hotel Lobelia',
        'Five Loaves Restaurant',
        'Castelli Restaurant',
        'Green Land Tours Ethiopia'
    ];

    const places = await prisma.place.findMany({
        where: {
            name: { in: targetNames }
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

    const report = targetNames.map(name => {
        const place = places.find(p => p.name === name);
        if (!place) return { name, exists: false };

        const audit = audits.find(a => a.entityId === place.id);
        const hasImages = place.images && place.images.length > 0;

        return {
            name: place.name,
            entityId: place.id,
            entityType: place.type,
            slug: place.slug,
            mainTableRowExists: true,
            relatedPlaceImageRowsCount: place.images ? place.images.length : 0,
            primaryVerifiedImageExists: hasImages ? place.images.some(img => img.imageUrl && img.imageUrl.includes('supabase.co')) : false,
            imageUrlCurrentlyStored: hasImages ? place.images[0].imageUrl : null,
            isSupabaseStorageUrl: hasImages ? place.images[0].imageUrl.includes('supabase.co') : false,
            auditStatus: audit ? audit.status : null,
            allImages: place.images.map(img => ({ url: img.imageUrl, priority: img.priority }))
        };
    });

    console.log(JSON.stringify(report, null, 2));
}

main().finally(() => {
    prisma.$disconnect();
    pool.end();
});
