async function fix() {
    // Fix missing maps on the V1 2000 Habesha
    const r = await fetch("http://localhost:3000/api/places?search=2000+Habesha");
    const d = await r.json();
    for (const p of d.places) {
        if (!p.googleMapsUrl) {
            console.log(`Fixing: ${p.name} (${p.id})`);
            // We need to hit the DB directly via admin endpoint — let's create a quick one
        }
    }
}
fix();
