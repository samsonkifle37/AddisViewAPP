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
        "name": "Five Loaves Restaurant",
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AHVAweqsjb2vhc19wEBOda46Z65sBoFcZMQlEiKHsUzPRj3Xp13jEpvPZhNP05u0YDR8KLTuL899OXsZUJhKAhfg1CWNjfiy7846lnm4Ae1U4WdXNs3tIfTIzHKlbYpYyqMZNAcdgRDh=w1920-h1080-k-no"
    },
    {
        "name": "Castelli Restaurant",
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AHVAwepKtARQhbdjMslzZwn6_aN5jWHyRl_9sXq1asuKL_2kuSVeNUDljDEta4QOJy0yoN2Y69OkvBs_SMdBsGC8Axk2w4Nz0AJExY6ERn9LuRiN7swpOnZ_hE245L-IY7lhbGG6MUsfHg=w1920-h1080-k-no"
    },
    {
        "name": "Lucy Lounge",
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AHVAwerJ8AcMf5yLAJKP1zQE_8rkJzi88xXOWneMtim7sU-o2_mr_4F8yw9o-kCLNE-MFrt0rhG8oO6O5yh_U4z-aR4Y7Nukn3wRuvtBVipgmx5sa8ZtQclGlF5me2EPfP2Nt3d-9ec=w1920-h1080-k-no"
    },
    {
        "name": "Sishu Restaurant",
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AHVAweqSum5OXIs54eZWj-brXdy_Nyxebf89m8FIb6-sAkexaAbDJdS3U5v0AnwIKxXtBfiNg2Pb8UxsOLua3rXFKdBIIsfSzQKEXMVWdYLaTiARQ4gENxVJf8nocNoxrdxpdZ46UIcgThRZM0T-=w1920-h1080-k-no"
    },
    {
        "name": "2000 Habesha Cultural Restaurant",
        "url": "https://lh3.googleusercontent.com/gps-cs-s/AHVAweopvcrXg7RzJ4Ys27_U8jAVhwjArR5iuThAhST-hvymqIOnn71T22IuFszWixMWwfry_sdvsnD0FSl5cQBQGUKYFMYAbBfiXx2_gBGItby2jbFMwd-wNKLN1C-BYloXbQonyN5WGBW8tXsn=w1920-h1080-k-no"
    },
    {
        "name": "Yod Abyssinia",
        "url": "https://lh3.googleusercontent.com/geougc-cs/ABOP9psUWnWMALor8Ls0f4_ebycNCj7QR-1AdHX__PGA0tvPVeCQp3QHtjAIZQu928D8jAUKqEepPuIOW6umy7sOm_24i-RMnw1eMowMVVGcXxh5Sxr4d_5qSchbcfnVH1IJN7bh442O7gxlvK0=w1920-h1080-k-no"
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
        const searchName = entity.search || entity.name;

        // 1. Find the place in the database. Exact matching first, then ILIKE.
        let placeResult = await pg.query(
            `SELECT id, name FROM "Place" WHERE name = $1`,
            [searchName]
        );

        if (placeResult.rows.length === 0) {
            placeResult = await pg.query(
                `SELECT id, name FROM "Place" WHERE name ILIKE $1`,
                [`%${searchName}%`]
            );
        }

        if (placeResult.rows.length === 0) {
            console.error(`  ✗ Place not found in DB: "${searchName}"`);
            failCount++;
            continue;
        }

        const placeId = placeResult.rows[0].id;
        console.log(`  Found in DB: ${placeId} (${placeResult.rows[0].name})`);

        try {
            // 2. Download the image
            console.log(`  Downloading from: ${entity.url.substring(0, 70)}...`);
            const response = await axios.get(entity.url, {
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
                },
                timeout: 30000
            });

            const buffer = Buffer.from(response.data);
            const contentType = response.headers['content-type'] || 'image/jpeg';
            let ext = contentType.split('/')[1] || 'jpg';
            if (ext === 'jpeg') ext = 'jpg';
            ext = ext.split(';')[0]; // simple sanitization

            // 3. Upload to Supabase Storage
            const storagePath = `places/${placeId}/official_hero_v3.${ext}`;
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

            // 5. Delete old PlaceImage records
            await pg.query(
                `DELETE FROM "PlaceImage" WHERE "placeId" = $1`,
                [placeId]
            );

            // 6. Insert new PlaceImage record
            const insertResult = await pg.query(
                `INSERT INTO "PlaceImage" (id, "placeId", "imageUrl", "imageSource", "altText", priority, "createdAt", "verifiedAt")
                 VALUES (gen_random_uuid(), $1, $2, 'google_maps', $3, 0, NOW(), NOW())
                 RETURNING id`,
                [placeId, publicUrl, `${placeResult.rows[0].name} - Google Maps`]
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
