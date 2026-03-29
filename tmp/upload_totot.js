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

const entityUrl = "https://lh3.googleusercontent.com/p/AF1QipP60IQ2FFELjXmvkn-77zIcklr4A54_am66Zc5V=w1920-h1080-k-no";
const searchName = "Totot Lounge";

async function main() {
    const pg = new Client({ connectionString: dbUrl });
    await pg.connect();

    try {
        let placeResult = await pg.query(
            `SELECT id, name FROM "Place" WHERE name = $1`,
            [searchName]
        );

        if (placeResult.rows.length === 0) {
            console.error("Place not found");
            return;
        }

        const placeId = placeResult.rows[0].id;

        const response = await axios.get(entityUrl, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const buffer = Buffer.from(response.data);
        const storagePath = `places/${placeId}/official_hero_v3.jpg`;
        await supabase.storage
            .from('public-images')
            .upload(storagePath, buffer, { contentType: 'image/jpeg', upsert: true });

        const { data: { publicUrl } } = supabase.storage
            .from('public-images')
            .getPublicUrl(storagePath);

        await pg.query(`DELETE FROM "PlaceImage" WHERE "placeId" = $1`, [placeId]);

        await pg.query(
            `INSERT INTO "PlaceImage" (id, "placeId", "imageUrl", "imageSource", "altText", priority, "createdAt", "verifiedAt")
             VALUES (gen_random_uuid(), $1, $2, 'google_maps', $3, 0, NOW(), NOW())`,
            [placeId, publicUrl, "Totot Lounge - Google Maps"]
        );

        console.log(`Success! Image updated for ${searchName}`);
    } catch (e) {
        console.error("Failed:", e.message);
    } finally {
        await pg.end();
    }
}

main();
