
const DINING_IMAGES = {
    "Five Loaves Restaurant": ["https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Ethiopian_Coffee_Ceremony.jpg/800px-Ethiopian_Coffee_Ceremony.jpg"],
    "Castelli Restaurant": ["https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/ET_Addis_asv2018-01_img25_Piazza_area.jpg/800px-ET_Addis_asv2018-01_img25_Piazza_area.jpg"],
    "2000 Habesha Cultural Restaurant": ["https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Ethiopian_Coffee_Ceremony.jpg/800px-Ethiopian_Coffee_Ceremony.jpg"],
    "Yod Abyssinia Cultural Restaurant": ["https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Ethiopian_Coffee_Ceremony.jpg/800px-Ethiopian_Coffee_Ceremony.jpg"]
};

async function repairDining() {
    console.log("Repairing Dining entities...");
    for (const [name, urls] of Object.entries(DINING_IMAGES)) {
        const res = await fetch("http://localhost:3000/api/admin/images/replace-all", {
            method: "POST",
            body: JSON.stringify({ name, urls })
        });
        const data = await res.json();
        console.log(`- ${name}: ${data.fixed} updated.`);
    }
}
repairDining();
