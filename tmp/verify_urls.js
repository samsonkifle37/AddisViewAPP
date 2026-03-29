
const fs = require('fs');

async function verify() {
    console.log("Verifying resolved URLs...");
    const res = await fetch('http://localhost:3000/api/admin/content-dashboard');
    const data = await res.json();

    const results = [];
    // Only check the ones we suspect are wikimedia
    const targets = data.entities.filter(e => e.verifiedImage || e.primaryImage);

    for (const e of targets.slice(0, 10)) { // Sample 10
        try {
            const placeRes = await fetch(`http://localhost:3000/api/places?search=${encodeURIComponent(e.name)}`);
            const placeData = await placeRes.json();
            const url = placeData.places?.[0]?.images?.[0]?.imageUrl;

            if (url) {
                const headRes = await fetch(url, { method: 'HEAD' });
                results.push({ name: e.name, url, status: headRes.status, ok: headRes.ok });
            }
        } catch (err) {
            results.push({ name: e.name, error: err.message });
        }
    }
    console.table(results);
}
verify();
