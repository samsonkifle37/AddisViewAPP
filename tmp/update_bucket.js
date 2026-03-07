const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    console.log("Updating 'public-images' bucket limit to 50MB...");
    const { data, error } = await supabase.storage.updateBucket('public-images', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 52428800 // 50MB
    });

    if (error) {
        console.error("Error updating bucket:", error);
    } else {
        console.log("Bucket updated successfully:", data);
    }
}

main();
