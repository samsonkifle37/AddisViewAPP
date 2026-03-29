const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const mapping = {
    // Food
    "Addis Ababa Food Tasting Tour": "https://hrbxtdzpseitkegkeknt.supabase.co/storage/v1/object/public/public-images/places/eda3476e-a143-497d-8185-135169dd669a/official_hero_v3.jpg",
    "Taste of Ethiopia Food Tour": "https://hrbxtdzpseitkegkeknt.supabase.co/storage/v1/object/public/public-images/places/eda3476e-a143-497d-8185-135169dd669a/official_hero_v3.jpg",

    // City/History/Tours
    "Full-Day City Tour of Addis Ababa": "https://hrbxtdzpseitkegkeknt.supabase.co/storage/v1/object/public/public-images/places/70ca6741-8a47-4576-92ee-d3c926cdf277/official_hero_v3.jpg",
    "Addis Ababa City Tour": "https://hrbxtdzpseitkegkeknt.supabase.co/storage/v1/object/public/public-images/places/70ca6741-8a47-4576-92ee-d3c926cdf277/official_hero_v3.jpg",
    "Lucy to Today: Addis Ababa's Living History Tour": "https://hrbxtdzpseitkegkeknt.supabase.co/storage/v1/object/public/public-images/places/69a105ed-0739-4f8f-aaf6-460e74ef6d22/official_hero_v3.jpg",
    "Entoto Mountain Guided Day Tour": "https://hrbxtdzpseitkegkeknt.supabase.co/storage/v1/object/public/public-images/places/1e9e4de8-9695-42cd-9c2f-2059cfa6711e/official_hero_v3.jpg",

    // Coffee
    "Kaldi's Coffee": "https://hrbxtdzpseitkegkeknt.supabase.co/storage/v1/object/public/public-images/places/dcf61b97-7e82-49e9-a505-b56ef29531cd/official_hero_v3.jpg",

    // Markets
    "Merkato": "https://hrbxtdzpseitkegkeknt.supabase.co/storage/v1/object/public/public-images/places/311eb0dd-2691-4dbe-831a-bef6166180a0/official_hero_v3.jpg",
    "Shiro Meda Market": "https://hrbxtdzpseitkegkeknt.supabase.co/storage/v1/object/public/public-images/places/311eb0dd-2691-4dbe-831a-bef6166180a0/official_hero_v3.jpg",

    // Museums / Cathedrals / Landmarks
    "St. George Cathedral": "https://hrbxtdzpseitkegkeknt.supabase.co/storage/v1/object/public/public-images/places/69a105ed-0739-4f8f-aaf6-460e74ef6d22/official_hero_v3.jpg",
    "Red Terror Martyrs' Memorial Museum": "https://hrbxtdzpseitkegkeknt.supabase.co/storage/v1/object/public/public-images/places/69a105ed-0739-4f8f-aaf6-460e74ef6d22/official_hero_v3.jpg",
    "Ethnological Museum": "https://hrbxtdzpseitkegkeknt.supabase.co/storage/v1/object/public/public-images/places/69a105ed-0739-4f8f-aaf6-460e74ef6d22/official_hero_v3.jpg",
    "Meskel Square": "https://hrbxtdzpseitkegkeknt.supabase.co/storage/v1/object/public/public-images/places/1b8cc80b-c760-42d6-842b-eb2cfdcbb885/official_hero_v3.jpg",
    "Addis Ababa Furi-Lebu Railway Station": "https://hrbxtdzpseitkegkeknt.supabase.co/storage/v1/object/public/public-images/places/1b8cc80b-c760-42d6-842b-eb2cfdcbb885/official_hero_v3.jpg",
    "Bole International Airport": "https://hrbxtdzpseitkegkeknt.supabase.co/storage/v1/object/public/public-images/places/1b8cc80b-c760-42d6-842b-eb2cfdcbb885/official_hero_v3.jpg",
};

async function run() {
    const pg = new Client({ connectionString: process.env.DATABASE_URL });
    await pg.connect();

    try {
        for (const [name, url] of Object.entries(mapping)) {
            let placeResult = await pg.query(`SELECT id FROM "Place" WHERE name = $1`, [name]);
            if (placeResult.rows.length === 0) continue;

            const placeId = placeResult.rows[0].id;

            // Delete any broken entries just in case
            await pg.query(`DELETE FROM "PlaceImage" WHERE "placeId" = $1`, [placeId]);

            // Insert new one
            await pg.query(
                `INSERT INTO "PlaceImage" (id, "placeId", "imageUrl", "imageSource", "altText", priority, "createdAt", "verifiedAt")
                 VALUES (gen_random_uuid(), $1, $2, 'reused_placeholder', $3, 0, NOW(), NOW())`,
                [placeId, url, name]
            );

            console.log(`✅ Bound Fallback Image: ${name}`);
        }

    } catch (e) {
        console.error("Critical error:", e);
    } finally {
        await pg.end();
    }
}

run();
