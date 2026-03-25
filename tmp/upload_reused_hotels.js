const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const mapping = {
    "Radisson Blu Hotel, Addis Ababa": "https://hrbxtdzpseitkegkeknt.supabase.co/storage/v1/object/public/public-images/places/radisson-blu-addis-ababa-hotel/cover.jpeg",
    "Sheraton Addis, a Luxury Collection Hotel": "https://hrbxtdzpseitkegkeknt.supabase.co/storage/v1/object/public/public-images/places/sheraton-addis-hotel/cover.webp",
    "Jupiter International Hotel Bole": "https://hrbxtdzpseitkegkeknt.supabase.co/storage/v1/object/public/public-images/places/jupiter-international-hotel-hotel/cover.avif",
    "Hilton Addis Ababa": "https://hrbxtdzpseitkegkeknt.supabase.co/storage/v1/object/public/public-images/places/golden-tulip-addis-ababa-hotel/cover.jpeg",
    "Monarch Parkview Hotel": "https://hrbxtdzpseitkegkeknt.supabase.co/storage/v1/object/public/public-images/places/5008bf5f-1ac7-42ff-a20d-840b7a6a1a63/official_hero.jpg"
};

async function run() {
    const pg = new Client({ connectionString: process.env.DATABASE_URL });
    await pg.connect();

    try {
        for (const [name, url] of Object.entries(mapping)) {
            let placeResult = await pg.query(`SELECT id FROM "Place" WHERE name = $1`, [name]);
            if (placeResult.rows.length === 0) continue;

            const placeId = placeResult.rows[0].id;

            // Insert new one
            await pg.query(
                `INSERT INTO "PlaceImage" (id, "placeId", "imageUrl", "imageSource", "altText", priority, "createdAt", "verifiedAt")
                 VALUES (gen_random_uuid(), $1, $2, 'reused_hotel', $3, 0, NOW(), NOW())`,
                [placeId, url, name]
            );

            console.log(`✅ Uploaded Hotel Image: ${name}`);
        }

    } catch (e) {
        console.error("Critical error:", e);
    } finally {
        await pg.end();
    }
}

run();
