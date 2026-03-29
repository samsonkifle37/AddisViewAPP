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
    { "name": "Simien Eco Tours", "url": "https://simienethiopiatours.com/wp-content/uploads/2026/01/welcome.jpg" },
    { "name": "Ethio Travel and Tours", "url": "https://ethiotravelandtours.com/wp-content/uploads/2025/08/Slide_01.jpg" },
    { "name": "Green Land Tours Ethiopia", "url": "https://cdn.getyourguide.com/image/tour_img/bba35d81a17207c5af9213faeca7d894d4edf0e711b4530d963f16da6171820e.jpg" },
    { "name": "Addis Nightlife Tour", "url": "https://static.wixstatic.com/media/a4eba5_f9a30da5f2c04140aeba3c2ed8c36fa4~mv2.jpg" },
    { "name": "Historical Addis Walking Tour", "url": "https://www.walkinethiopia.com/images/newbanners/1-lalibela.jpg" },
    { "name": "Afro Ethiopia tour", "url": "https://afroethiopiatour.com/wp-content/uploads/2026/01/Blue-Nile-Tis-Abay-waterwall-1024x683.jpg" },
    { "name": "Danakil Depression Tour", "url": "https://img1.wsimg.com/isteam/ip/3cbfe673-f7bd-4b44-acf1-a348f40254cf/fb_3713176152112955_900x593-0002-ef9625a.jpg" },
    { "name": "Rock-Hewn Churches of Lalibela", "url": "https://whc.unesco.org/uploads/thumbs/site_0018_0016-400-400-20151104173458.webp" },
    { "name": "Bale Mountains National Park", "url": "https://balemountains.org/wp-content/uploads/2014/01/delphin-ruche021.jpg" },
    { "name": "Entoto Mountain Tour", "url": "https://lh3.googleusercontent.com/gps-cs-s/AHVAweqj6phsp-nbXp8N_Ax4hCBKzS7D9ChiqyZC9ebC8IQrMhIGKyKN16cIKUQ8NoZIYdQpyDHcEVSsS6rWLodkC8sSPKJ-vwLB2KCrqzJMNG_Sc58DaxB-5kcqnl8Ce8XIqqgzeOgUTA=w1920-h1080-k-no" },
    { "name": "Merkato Market Tour", "url": "https://lh3.googleusercontent.com/gps-cs-s/AHVAwepTKSh_oJmJVJRim3c9M-6e1KIhw69gNPn4ueAtPLypbU0_plJSaBBtvGSRSMY6_WXDxNjvre1qna-EKUShEr-ccgdC2oguOVco25_VlxnbHu2g78kVB1GUAYae0JnN85Q7Ar6G=w1920-h1080-k-no" },
    { "name": "Alem Bunna", "url": "https://lh3.googleusercontent.com/gps-cs-s/AHVAwepejz8F3tUXrvoQPOhWV69GYtc0VodHe19fug_Cgz80Hw031ouVPhFG5t4eo1FyIBoFLAQ9w-Mnl-iSSXkXMtP1-7HYwnQ3TF7HY0QUHkofGJYsQE07MVbNyVjyh5PAI-u9utrWnQ=w1920-h1080-k-no" },
    { "name": "Garden of Coffee", "url": "https://lh3.googleusercontent.com/p/AF1QipOyfUWUkfnyq1l9cQuzIXLEOirh0wvn2X5elY_j=w1920-h1080-k-no" },
    { "name": "Atikilt Tera vegetable market", "url": "https://lh3.googleusercontent.com/gps-cs-s/AHVAweowuPOp_QMWdFqOADSZKVo27L5-kY9NIjp257lSRMLgqK3uj8q2jn9EiW-LH-YuCL411u9yFhMTKmqrFFr8iphIHNhh1F_5KxoXchlS98m_SR2Z4UXUorBzJ1lkkp9c0T74s3lT2w=w1920-h1080-k-no" },
    { "name": "AbealTibeb Shromeda", "url": "https://abealtebeb.com/images/abealtebeb%20(19%20(Custom).jpg" },
    { "name": "Entoto Natural Park", "url": "https://lh3.googleusercontent.com/gps-cs-s/AHVAwerei48lzShR6qoacfr5EBNwU4WufjXPDTpIjHX6Kj55RtqP1TM1b2-jQ3vDJmJd9DBu6ofMIFjdoXgsx10noxZjVqGZhD2oiqgBeh-RzjIv_TxxJz6BHKTaPCGxmo6onn0ehpdwOA=w1920-h1080-k-no" },
    { "name": "Mount Entoto viewpoint", "url": "https://lh3.googleusercontent.com/p/AF1QipO-qh7hGL__gQ9mFFGkvykPGtaDPpd8dh_XzUxU=w1920-h1080-k-no" },
    { "name": "Ethnological Museum (Addis Ababa University)", "search": "Ethnological Museum", "url": "https://lh3.googleusercontent.com/gps-cs-s/AHVAweo5n__sz6FtfOiz-XfAMN5DV3FrDYzD6uHoKE5cNxLBzx7OFeSa79KQjaAwuNRe3-uxqWos4K29LZYFtkPKpa1YgECjrdvZa1x-TpLhSol3QJPWEB8LlQWx8ozduD6zhAJ8B_TrnNwyuSo=w1920-h1080-k-no" }
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
