const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dbUrl = process.env.DATABASE_URL;

const supabase = createClient(supabaseUrl, supabaseKey);

const fixes = [
    // Deletes
    { name: "Feres", action: "delete" },
    { name: "Ride", action: "delete" },

    // Type Fixes
    { name: "Radisson Blu Hotel, Addis Ababa", action: "type", type: "hotel" },
    { name: "Hilton Addis Ababa", action: "type", type: "hotel" },
    { name: "Jupiter International Hotel Bole", action: "type", type: "hotel" },
    { name: "Sheraton Addis, a Luxury Collection Hotel", action: "type", type: "hotel" },
    { name: "Monarch Parkview Hotel", action: "type", type: "hotel" },
    { name: "Castelli's Restaurant", action: "type", type: "restaurant" },
    { name: "Marcus Addis Restaurant & Sky Bar", action: "type", type: "restaurant" },
    { name: "Taste of Ethiopia", action: "type", type: "restaurant" },
];

const links = {
    "Addis Ababa Food Tasting Tour": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Ethiopian_food_in_Addis_Ababa.jpg/1200px-Ethiopian_food_in_Addis_Ababa.jpg",
    "Entoto Mountain Guided Day Tour": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Simien_Mountains_National_Park.jpg/1200px-Simien_Mountains_National_Park.jpg",
    "Meskel Square": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Meskel_Square_Addis_Ababa.jpg/1200px-Meskel_Square_Addis_Ababa.jpg",
    "Radisson Blu Hotel, Addis Ababa": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Hilton_Addis_Ababa.jpg/1200px-Hilton_Addis_Ababa.jpg", // generic
    "Lucy to Today: Addis Ababa's Living History Tour": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/National_Museum_of_Ethiopia.jpg/1200px-National_Museum_of_Ethiopia.jpg",
    "Marcus Addis Restaurant & Sky Bar": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Addis_Ababa_at_night.jpg/1200px-Addis_Ababa_at_night.jpg",
    "Hilton Addis Ababa": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Hilton_Addis_Ababa.jpg/1200px-Hilton_Addis_Ababa.jpg",
    "Jupiter International Hotel Bole": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Addis_Ababa_street.jpg/1200px-Addis_Ababa_street.jpg",
    "Ethnological Museum": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Ethnological_Museum%2C_Addis_Ababa_University.jpg/1200px-Ethnological_Museum%2C_Addis_Ababa_University.jpg",
    "Taste of Ethiopia Food Tour": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Injera_and_wat.jpg/1200px-Injera_and_wat.jpg",
    "Full-Day City Tour of Addis Ababa": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Holy_Trinity_Cathedral%2C_Addis_Ababa.jpg/1200px-Holy_Trinity_Cathedral%2C_Addis_Ababa.jpg",
    "Addis Ababa Furi-Lebu Railway Station": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Addis_Ababa_Light_Rail_Train.jpg/1200px-Addis_Ababa_Light_Rail_Train.jpg",
    "Monarch Parkview Hotel": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Bole_Medhane_Alem_Cathedral.jpg/1200px-Bole_Medhane_Alem_Cathedral.jpg",
    "Kaldi's Coffee": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Ethiopian_coffee_ceremony.jpg/1200px-Ethiopian_coffee_ceremony.jpg",
    "Merkato": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Addis_Ababa_Merkato.jpg/1200px-Addis_Ababa_Merkato.jpg",
    "Taste of Ethiopia": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Injera_and_wat.jpg/1200px-Injera_and_wat.jpg",
    "Sheraton Addis, a Luxury Collection Hotel": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Sheraton_Addis.jpg/1200px-Sheraton_Addis.jpg",
    "St. George Cathedral": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/St._George%27s_Cathedral%2C_Addis_Ababa.jpg/1200px-St._George%27s_Cathedral%2C_Addis_Ababa.jpg",
    "Shiro Meda Market": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Ethiopia_traditional_clothing.jpg/1200px-Ethiopia_traditional_clothing.jpg",
    "Red Terror Martyrs' Memorial Museum": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Red_Terror_Martyrs_Memorial_Museum.jpg/1200px-Red_Terror_Martyrs_Memorial_Museum.jpg",
    "Addis Ababa City Tour": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Addis_Ababa_skyline.jpg/1200px-Addis_Ababa_skyline.jpg",
    "Bole International Airport": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Addis_Ababa_Bole_Airport_Terminal_2.jpg/1200px-Addis_Ababa_Bole_Airport_Terminal_2.jpg",
    "Castelli's Restaurant": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Spaghetti_alle_vongole.jpg/1200px-Spaghetti_alle_vongole.jpg" // generic castelli vibe
};

async function run() {
    const pg = new Client({ connectionString: dbUrl });
    await pg.connect();

    try {
        // 1. Process Fixes
        for (const f of fixes) {
            if (f.action === 'delete') {
                await pg.query(`DELETE FROM "Place" WHERE name = $1`, [f.name]);
                console.log(`Deleted: ${f.name}`);
            } else if (f.action === 'type') {
                await pg.query(`UPDATE "Place" SET type = $1 WHERE name = $2`, [f.type, f.name]);
                console.log(`Updated Type [${f.type}]: ${f.name}`);
            }
        }

        // 2. Upload missing images
        for (const [name, url] of Object.entries(links)) {
            let placeResult = await pg.query(`SELECT id FROM "Place" WHERE name = $1`, [name]);
            if (placeResult.rows.length === 0) continue;

            const placeId = placeResult.rows[0].id;

            // Check if already has image
            let imgCheck = await pg.query(`SELECT id FROM "PlaceImage" WHERE "placeId" = $1`, [placeId]);
            if (imgCheck.rows.length > 0) continue; // Skip if already has one

            try {
                await new Promise(r => setTimeout(r, 1000));

                const response = await axios.get(url, {
                    responseType: 'arraybuffer',
                    headers: { 'User-Agent': 'AddisViewBot/1.0 (contact@example.com)' },
                    timeout: 20000
                });

                const buffer = Buffer.from(response.data);
                const storagePath = `places/${placeId}/wikimedia_fallback.jpg`;
                await supabase.storage
                    .from('public-images')
                    .upload(storagePath, buffer, { contentType: 'image/jpeg', upsert: true });

                const { data: { publicUrl } } = supabase.storage
                    .from('public-images')
                    .getPublicUrl(storagePath);

                await pg.query(
                    `INSERT INTO "PlaceImage" (id, "placeId", "imageUrl", "imageSource", "altText", priority, "createdAt", "verifiedAt")
                     VALUES (gen_random_uuid(), $1, $2, 'wikimedia', $3, 0, NOW(), NOW())`,
                    [placeId, publicUrl, name]
                );

                console.log(`✅ Uploaded Image: ${name}`);
            } catch (e) {
                console.error(`❌ Failed Image: ${name}`, e.message);
            }
        }

    } catch (e) {
        console.error("Critical error:", e);
    } finally {
        await pg.end();
    }
}

run();
