const axios = require('axios');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const fallbacks = [
    { name: "Green Land Tours Ethiopia", search: "Simien Mountains", fallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Simien_Mountains_National_Park.jpg/1200px-Simien_Mountains_National_Park.jpg' },
    { name: "Rock-Hewn Churches of Lalibela", search: "Church of Saint George, Lalibela", fallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Bete_Giyorgis_Lalibela_Ethiopia.jpg/1200px-Bete_Giyorgis_Lalibela_Ethiopia.jpg' },
    { name: "AbealTibeb Shromeda", search: "AbealTibeb Shromeda", fallbackUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Ethiopia_traditional_clothing.jpg/1200px-Ethiopia_traditional_clothing.jpg' }
];

async function run() {
    const pg = new Client({ connectionString: process.env.DATABASE_URL });
    await pg.connect();

    for (const f of fallbacks) {
        console.log(`Fallback for ${f.name}...`);
        try {
            const placeRes = await pg.query(`SELECT id FROM "Place" WHERE name ILIKE $1`, [`%${f.name}%`]);
            if (placeRes.rows.length === 0) continue;
            const placeId = placeRes.rows[0].id;

            const res = await axios.get(f.fallbackUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(res.data);

            const storagePath = `places/${placeId}/official_hero_v3.jpg`;
            await supabase.storage.from('public-images').upload(storagePath, buffer, { contentType: 'image/jpeg', upsert: true });

            const { data: { publicUrl } } = supabase.storage.from('public-images').getPublicUrl(storagePath);

            await pg.query(`DELETE FROM "PlaceImage" WHERE "placeId" = $1`, [placeId]);
            await pg.query(
                `INSERT INTO "PlaceImage" (id, "placeId", "imageUrl", "imageSource", "altText", priority, "createdAt", "verifiedAt")
                 VALUES (gen_random_uuid(), $1, $2, 'wikimedia', $3, 0, NOW(), NOW())`,
                [placeId, publicUrl, f.name]
            );
            console.log(`Success fallback for ${f.name}: ${publicUrl}`);
        } catch (e) {
            console.log(`Failed fallback for ${f.name}: ${e.message}`);
        }
    }
    await pg.end();
}

run();
