const axios = require('axios');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

async function run() {
    const adminSecret = process.env.ADMIN_SEED_SECRET || "addisview_seed_secret_2026";
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    console.log("Starting bulk process...");
    try {
        const response = await axios.post(`${baseUrl}/api/admin/images/bulk-process`, {
            batchFile: "sourced_images_final.json"
        }, {
            headers: {
                'Authorization': `Bearer ${adminSecret}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Results Summary:");
        console.log(`Total: ${response.data.total}`);
        const succeeded = response.data.results.filter(r => r.success).length;
        console.log(`Succeeded: ${succeeded}`);

        if (succeeded < response.data.total) {
            console.log("Some failed. Details of first failure:");
            const failure = response.data.results.find(r => !r.success);
            console.log(JSON.stringify(failure, null, 2));
        }
    } catch (error) {
        console.error("Bulk process failed:", error.response?.data || error.message);
    }
}

run();
