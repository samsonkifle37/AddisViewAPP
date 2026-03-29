
const targets = [
    "Bole Ambassador Hotel", "Hotel Lobelia", "Harmony Hotel Addis Ababa",
    "Hyatt Regency Addis Ababa", "Kuriftu Resort & Spa", "Bole Luxury Apartment",
    "Z Guest House", "Adot Tina Hotel", "Haile Grand Addis Ababa", "Mado Hotel",
    "Ethiopian Skylight Hotel", "Ethio Travel and Tours", "Green Land Tours Ethiopia",
    "Entoto Mountain Tour", "Merkato Market Tour", "Moplaco Coffee Shop",
    "Galani Coffee", "Alem Bunna", "Atikilt Tera vegetable market", "Sabon Tera Market",
    "Shiromeda Market", "Piazza Market Area", "Shola Market", "Merkato Market",
    "Mount Entoto viewpoint", "Entoto Natural Park", "Ethnological Museum (Addis Ababa University)",
    "Menelik II Palace", "Unity Park", "National Museum of Ethiopia",
    "Bale Mountains National Park", "Danakil Depression Tour", "Rock-Hewn Churches of Lalibela"
];

async function check() {
    console.log("Starting full check...");
    const list = [];
    for (const name of targets) {
        try {
            const res = await fetch(`http://localhost:3000/api/places?search=${encodeURIComponent(name)}`);
            const data = await res.json();
            const p = data.places?.find(x => x.name.toLowerCase().includes(name.toLowerCase()));
            if (p) {
                list.push({
                    name: p.name,
                    id: p.id,
                    images: p.images?.length || 0,
                    primary: p.images?.[0]?.imageUrl || "EMPTY",
                    audit: p.auditStatus
                });
            } else {
                list.push({ name, status: "NOT_FOUND" });
            }
        } catch (e) {
            list.push({ name, error: e.message });
        }
    }
    console.log(JSON.stringify(list, null, 2));
}

check();
