const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // Also load .env for other vars

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    console.log("Creating 'public-images' bucket...");
    const { data, error } = await supabase.storage.createBucket('public-images', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 10485760 // 10MB
    });

    if (error) {
        if (error.message.includes('already exists')) {
            console.log("Bucket already exists.");
        } else {
            console.error("Error creating bucket:", error);
        }
    } else {
        console.log("Bucket created successfully:", data);
    }
}

main();
