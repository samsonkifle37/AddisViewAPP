const axios = require('axios');
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

const realImages = [
    {
        name: "Gulele Botanical Garden",
        url: "https://lh3.googleusercontent.com/gps-cs-s/AHVAwepACDSBLOxEaO0uVOds4Q5Jp42vNVtLrutJNEURBiLLDcSGOgm4kMP6KTDHpuidg5q4KWEE6jnn2IFMPQAH0GruEtGt6oAAfMFVoDUxPc7sN9zObZTX7OlMZMO4qPCYd7ixiNaq6A=s2048"
    },
    {
        name: "Haile Grand Addis Ababa", // Matching the DB name
        url: "https://hailehotelsandresorts.com/wp-content/uploads/2022/12/314044057_189990350219839_5932524390586956587_n.jpg"
    },
    {
        name: "Bole Ambassador Hotel",
        url: "https://lh3.googleusercontent.com/gps-proxy/ALd4DhFWwgi5GrrVtPKjwBAt_TwF5GPV4ihnJaUoKUbQ8gO5ptbBkfy_bugXPDvFb4HMSvLsuv54CJn4NcqxpJrmeGXguGw7Os_y3kEws5luLuHTiEkHBwiVtcDSrnqxZXwBX_ftrzpUYBilG4e5vNOTudP37Jf_r_sZ-hnWQOh7jINMVDxZEYtdAXe8=w1920-h1080-k-no"
    },
    {
        name: "Kuriftu Resort & Spa",
        url: "https://kuriftu-media.s3.us-east-1.amazonaws.com/home/DJI_0405.JPG"
    },
    {
        name: "Mado Hotel",
        url: "https://madohotels.com/wp-content/uploads/2023/06/ABE00259-min-scaled.jpg"
    },
    {
        name: "Ethiopian Skylight Hotel",
        url: "https://www.ethiopianskylighthotel.com/images/default-source/default-album/banner/sky-bldg-680-x-43996700a0a-423e-42a3-b550-f34770e4b5dd.jpg?sfvrsn=8a3f592b_1"
    }
];

async function main() {
    const pg = new Client({ connectionString: dbUrl });
    await pg.connect();
    console.log("Connected to database");

    let successCount = 0;
    let failCount = 0;

    for (const entity of realImages) {
        console.log(`\n--- Processing: ${entity.name} ---`);

        // 1. Find the place in the database
        const placeResult = await pg.query(
            `SELECT id, name FROM "Place" WHERE name ILIKE $1 OR name ILIKE $2`,
            [entity.name, entity.name + '%']
        );

        if (placeResult.rows.length === 0) {
            console.error(`  ✗ Place not found in DB: "${entity.name}"`);
            failCount++;
            continue;
        }

        const placeId = placeResult.rows[0].id;
        console.log(`  Found in DB: ${placeId} (${placeResult.rows[0].name})`);

        try {
            // 2. Download the image
            console.log(`  Downloading from: ${entity.url.substring(0, 60)}...`);
            const response = await axios.get(entity.url, {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
                },
                timeout: 10000
            });

            const buffer = Buffer.from(response.data);
            const contentType = response.headers['content-type'] || 'image/jpeg';
            let ext = contentType.split('/')[1] || 'jpg';
            if (ext === 'jpeg') ext = 'jpg';

            // 3. Upload to Supabase Storage
            const storagePath = `places/${placeId}/official_hero.${ext}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('public-images')
                .upload(storagePath, buffer, {
                    contentType,
                    upsert: true
                });

            if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

            // 4. Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('public-images')
                .getPublicUrl(storagePath);

            console.log(`  Uploaded: ${publicUrl}`);

            // 5. Delete old PlaceImage records (including AI ones)
            await pg.query(
                `DELETE FROM "PlaceImage" WHERE "placeId" = $1`,
                [placeId]
            );

            // 6. Insert new PlaceImage record
            const insertResult = await pg.query(
                `INSERT INTO "PlaceImage" (id, "placeId", "imageUrl", "imageSource", "altText", priority, "createdAt", "verifiedAt")
                 VALUES (gen_random_uuid(), $1, $2, 'official_website', $3, 0, NOW(), NOW())
                 RETURNING id`,
                [placeId, publicUrl, `${placeResult.rows[0].name} - Official`]
            );

            console.log(`  ✓ PlaceImage updated with official photo!`);
            successCount++;
        } catch (e) {
            console.error(`  ✗ Failed processing image: ${e.message}`);
            failCount++;
        }
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
