async function checkPlaces() {
    const urls = [
        "http://localhost:3000/api/places?search=Bole%20Ambassador",
        "http://localhost:3000/api/places?search=Hotel%20Lobelia",
        "http://localhost:3000/api/places?search=Castelli",
        "http://localhost:3000/api/places?search=Five%20Loaves",
        "http://localhost:3000/api/places?search=Green%20Land%20Tours%20Ethiopia"
    ];

    const results = [];
    for (const url of urls) {
        try {
            const r = await fetch(url);
            const d = await r.json();
            if (d.places && d.places.length > 0) {
                const p = d.places[0]; // grab top result
                results.push({
                    name: p.name,
                    id: p.id,
                    type: p.type,
                    slug: p.slug,
                    hasMainRow: true,
                    imagesCount: p.images ? p.images.length : 0,
                    primaryVerifiedExists: p.images && p.images.length > 0 ? p.images.some(i => i.imageUrl.includes('supabase.co')) : false,
                    imageUrlStored: p.images && p.images.length > 0 ? p.images[0].imageUrl : null,
                    isSupabaseUrl: p.images && p.images.length > 0 ? p.images[0].imageUrl.includes('supabase.co') : false,
                    auditStatus: p.auditStatus
                });
            }
        } catch (e) {
            console.error("Error on ", url, e.message);
        }
    }
    const fs = require('fs');
    fs.writeFileSync('tmp/check_places_output.json', JSON.stringify(results, null, 2));
}

checkPlaces();
