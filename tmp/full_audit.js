// Full entity audit — hit the running local API
async function audit() {
    // Fetch ALL places (no filter, high limit)
    const res = await fetch("http://localhost:3000/api/places?limit=200");
    const data = await res.json();
    const places = data.places || [];

    const report = places.map(p => ({
        name: p.name,
        type: p.type,
        slug: p.slug,
        id: p.id,
        primary_image_present: (p.images && p.images.length > 0) ? "yes" : "no",
        gallery_count: p.images ? p.images.length : 0,
        image_urls: p.images ? p.images.map(i => i.imageUrl) : [],
        has_supabase_image: p.images ? p.images.some(i => i.imageUrl && i.imageUrl.includes("supabase.co")) : false,
        has_wikimedia_image: p.images ? p.images.some(i => i.imageUrl && i.imageUrl.includes("wikimedia.org")) : false,
        description_present: !!(p.longDescription || p.shortDescription),
        short_desc: p.shortDescription ? p.shortDescription.substring(0, 60) : null,
        maps_link_present: !!p.googleMapsUrl,
        website_present: !!p.websiteUrl,
        contact_present: !!(p.phone || p.email || p.bookingUrl),
        auditStatus: p.auditStatus || null,
    }));

    // Sort by type
    report.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));

    const fs = require("fs");
    fs.writeFileSync("tmp/full_audit_report.json", JSON.stringify(report, null, 2));

    // Summary
    const types = [...new Set(report.map(r => r.type))];
    console.log(`\nTotal entities: ${report.length}`);
    console.log(`\nBy type:`);
    for (const t of types) {
        const items = report.filter(r => r.type === t);
        const withImg = items.filter(r => r.primary_image_present === "yes").length;
        const withDesc = items.filter(r => r.description_present).length;
        const withMaps = items.filter(r => r.maps_link_present).length;
        const withWeb = items.filter(r => r.website_present).length;
        const withContact = items.filter(r => r.contact_present).length;
        console.log(`  ${t}: ${items.length} total | img:${withImg} | desc:${withDesc} | maps:${withMaps} | web:${withWeb} | contact:${withContact}`);
    }

    // List missing images
    const missingImg = report.filter(r => r.primary_image_present === "no");
    console.log(`\nEntities missing primary image (${missingImg.length}):`);
    missingImg.forEach(r => console.log(`  - ${r.name} (${r.type})`));

    // List missing maps
    const missingMaps = report.filter(r => !r.maps_link_present);
    console.log(`\nEntities missing maps link (${missingMaps.length}):`);
    missingMaps.forEach(r => console.log(`  - ${r.name} (${r.type})`));

    // List missing description
    const missingDesc = report.filter(r => !r.description_present);
    console.log(`\nEntities missing description (${missingDesc.length}):`);
    missingDesc.forEach(r => console.log(`  - ${r.name} (${r.type})`));
}

audit().catch(console.error);
