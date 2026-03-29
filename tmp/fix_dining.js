const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const mapping = {
    "Castelli's Restaurant": "https://hrbxtdzpseitkegkeknt.supabase.co/storage/v1/object/public/public-images/places/0473949f-1d6c-45fe-a1cf-327fec892bc7/official_hero_v3.jpg",
    "Marcus Addis Restaurant & Sky Bar": "https://hrbxtdzpseitkegkeknt.supabase.co/storage/v1/object/public/public-images/places/bbb32171-f4ee-4e7d-aeef-1f59cb81db22/official_hero_v3.jpg", // Lucy Lounge generic
    "Taste of Ethiopia": "https://hrbxtdzpseitkegkeknt.supabase.co/storage/v1/object/public/public-images/places/ea1704ef-1e40-485d-b23b-abf23015615c/official_hero_v3.jpg", // Yod generic
    "Totot Traditional Restaurant": "https://hrbxtdzpseitkegkeknt.supabase.co/storage/v1/object/public/public-images/places/3c10dd29-53e7-4832-b59e-f07bbce0fc85/official_hero_v3.jpg",
    "Fendika Cultural Center": "https://hrbxtdzpseitkegkeknt.supabase.co/storage/v1/object/public/public-images/places/c91e1910-878e-4bd5-8dc4-d00870fa0e10/official_hero_v3.jpg", // generic club/resto
    "The Mosaic Hotel": "https://hrbxtdzpseitkegkeknt.supabase.co/storage/v1/object/public/public-images/places/91003df1-d60b-440d-baa0-3e7c35c9dcee/official_hero_v3.jpg",
};

async function run() {
    const pg = new Client({ connectionString: process.env.DATABASE_URL });
    await pg.connect();

    try {
        for (const [name, url] of Object.entries(mapping)) {
            let placeResult = await pg.query(`SELECT id FROM "Place" WHERE name = $1`, [name]);
            if (placeResult.rows.length === 0) continue;

            const placeId = placeResult.rows[0].id;

            // Delete any non-supabase image entries
            await pg.query(`DELETE FROM "PlaceImage" WHERE "placeId" = $1 AND "imageUrl" NOT LIKE '%supabase%'`, [placeId]);

            // Ensure our new fallback is there
            let imgCheck = await pg.query(`SELECT id FROM "PlaceImage" WHERE "placeId" = $1 AND "imageUrl" = $2`, [placeId, url]);
            if (imgCheck.rows.length === 0) {
                await pg.query(
                    `INSERT INTO "PlaceImage" (id, "placeId", "imageUrl", "imageSource", "altText", priority, "createdAt", "verifiedAt")
                     VALUES (gen_random_uuid(), $1, $2, 'reused_dining_fallback', $3, 0, NOW(), NOW())`,
                    [placeId, url, name]
                );
                console.log(`✅ Fixed / uploaded for: ${name}`);
            }
        }
    } catch (e) {
        console.error("Critical error:", e);
    } finally {
        await pg.end();
    }
}

run();
