const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dbUrl = process.env.DATABASE_URL;

if (!supabaseUrl || !supabaseKey || !dbUrl) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Map: entity name -> generated image file path
const IMAGES_DIR = 'C:\\Users\\samso\\.gemini\\antigravity\\brain\\7f380f5a-da05-4d17-8442-220c46ec9ec4';

const entities = [
    { name: "Kuriftu Resort & Spa", file: "kuriftu_resort_spa" },
    { name: "Bole Luxury Apartment", file: "bole_luxury_apartment" },
    { name: "Z Guest House", file: "z_guest_house" },
    { name: "Adot Tina Hotel", file: "adot_tina_hotel" },
    { name: "Haile Grand Addis Ababa", file: "haile_grand_hotel" },
    { name: "Mado Hotel", file: "mado_hotel" },
    { name: "Ethiopian Skylight Hotel", file: "ethiopian_skylight_hotel" },
    { name: "Ethio Travel and Tours", file: "ethio_travel_tours" },
    { name: "Green Land Tours Ethiopia", file: "greenland_tours" },
    { name: "Entoto Mountain Tour", file: "entoto_mountain_tour" },
    { name: "Moplaco Coffee Shop", file: "moplaco_coffee_shop" },
    { name: "Galani Coffee", file: "galani_coffee" },
    { name: "Atikilt Tera vegetable market", file: "atikilt_tera_market" },
    { name: "Sabon Tera Market", file: "sabon_tera_market" },
    { name: "Shiromeda Market", file: "shiromeda_market" },
    { name: "Piazza Market Area", file: "piazza_market_area" },
    { name: "Shola Market", file: "shola_market" },
];

async function findImageFile(baseName) {
    // Files have a timestamp suffix, e.g. kuriftu_resort_spa_1772902496988.png
    const files = fs.readdirSync(IMAGES_DIR);
    const match = files.find(f => f.startsWith(baseName + '_') && f.endsWith('.png'));
    if (match) return path.join(IMAGES_DIR, match);
    // Try exact match
    const exact = files.find(f => f === baseName + '.png');
    if (exact) return path.join(IMAGES_DIR, exact);
    return null;
}

async function main() {
    const pg = new Client({ connectionString: dbUrl });
    await pg.connect();
    console.log("Connected to database");

    let successCount = 0;
    let failCount = 0;

    for (const entity of entities) {
        console.log(`\n--- Processing: ${entity.name} ---`);

        // 1. Find the image file
        const imgPath = await findImageFile(entity.file);
        if (!imgPath) {
            console.error(`  ✗ Image file not found for ${entity.file}`);
            failCount++;
            continue;
        }
        console.log(`  Found image: ${path.basename(imgPath)}`);

        // 2. Find the place in the database
        const placeResult = await pg.query(
            `SELECT id, name FROM "Place" WHERE name = $1`,
            [entity.name]
        );

        if (placeResult.rows.length === 0) {
            console.error(`  ✗ Place not found in DB: "${entity.name}"`);
            failCount++;
            continue;
        }

        const placeId = placeResult.rows[0].id;
        console.log(`  Found in DB: ${placeId}`);

        // 3. Upload to Supabase Storage
        const fileBuffer = fs.readFileSync(imgPath);
        const storagePath = `places/${placeId}/hero.png`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('public-images')
            .upload(storagePath, fileBuffer, {
                contentType: 'image/png',
                upsert: true
            });

        if (uploadError) {
            console.error(`  ✗ Upload failed: ${uploadError.message}`);
            failCount++;
            continue;
        }

        // 4. Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('public-images')
            .getPublicUrl(storagePath);

        console.log(`  Uploaded: ${publicUrl}`);

        // 5. Delete old PlaceImage records
        await pg.query(
            `DELETE FROM "PlaceImage" WHERE "placeId" = $1`,
            [placeId]
        );

        // 6. Insert new PlaceImage record
        const insertResult = await pg.query(
            `INSERT INTO "PlaceImage" (id, "placeId", "imageUrl", "imageSource", "altText", priority, "createdAt", "verifiedAt")
             VALUES (gen_random_uuid(), $1, $2, 'generated', $3, 0, NOW(), NOW())
             RETURNING id`,
            [placeId, publicUrl, `${entity.name} - AddisView`]
        );

        console.log(`  ✓ PlaceImage created: ${insertResult.rows[0].id}`);
        successCount++;
    }

    console.log(`\n========================================`);
    console.log(`Done! Success: ${successCount}, Failed: ${failCount}`);
    console.log(`========================================`);

    await pg.end();
}

main().catch(e => {
    console.error("Fatal error:", e);
    process.exit(1);
});
