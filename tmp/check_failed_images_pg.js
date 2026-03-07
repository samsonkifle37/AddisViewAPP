const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function main() {
    const targetNames = [
        'Bole Ambassador Hotel',
        'Hotel Lobelia',
        'Five Loaves Restaurant',
        'Castelli Restaurant',
        'Green Land Tours Ethiopia'
    ];

    try {
        const placesQuery = await pool.query(
            `SELECT id, type, slug, name FROM "Place" WHERE name = ANY($1)`,
            [targetNames]
        );
        const places = placesQuery.rows;

        const report = [];

        for (const place of places) {
            const imagesQuery = await pool.query(
                `SELECT "imageUrl", "priority", "imageSource", "verifiedAt" FROM "PlaceImage" WHERE "placeId" = $1 ORDER BY "priority" ASC`,
                [place.id]
            );
            const images = imagesQuery.rows;

            const auditQuery = await pool.query(
                `SELECT status, notes FROM "ImageAudit" WHERE "entityId" = $1`,
                [place.id]
            );
            const audit = auditQuery.rows[0];

            report.push({
                name: place.name,
                entityId: place.id,
                entityType: place.type,
                slug: place.slug,
                mainTableRowExists: true,
                relatedPlaceImageRowsCount: images.length,
                primaryVerifiedImageExists: images.some(img => img.imageUrl && img.imageUrl.includes('supabase.co')),
                imageUrlCurrentlyStored: images.length > 0 ? images[0].imageUrl : null,
                isSupabaseStorageUrl: images.length > 0 ? images[0].imageUrl.includes('supabase.co') : false,
                auditStatus: audit ? audit.status : null,
            });
        }

        console.log(JSON.stringify(report, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

main();
