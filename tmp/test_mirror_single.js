
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMirror() {
    const url = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/ET_Addis_asv2018-01_img33_Bole_area.jpg/800px-ET_Addis_asv2018-01_img33_Bole_area.jpg";
    console.log(`Testing mirror for: ${url}`);

    try {
        const res = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'AddisViewBot/1.0 (contact: admin@addisview.app)',
                'Accept': 'image/*'
            }
        });

        console.log(`Status: ${res.status}`);
        console.log(`Content-Type: ${res.headers['content-type']}`);

        const buffer = Buffer.from(res.data);
        const { data, error } = await supabase.storage
            .from('public-images')
            .upload('test/bole-test.jpg', buffer, {
                contentType: res.headers['content-type'],
                upsert: true
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('public-images')
            .getPublicUrl('test/bole-test.jpg');

        console.log(`Success! Public URL: ${publicUrl}`);
    } catch (e) {
        console.error("Failed:", e.message);
        if (e.response) {
            console.error("Response data:", e.response.data.toString());
            console.error("Response headers:", e.response.headers);
        }
    }
}

testMirror();
