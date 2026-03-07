const fs = require('fs');

const missingItemsPatch = [
    { name: "Addis Ababa Museum", filename: "Addis_Ababa_Museum_(11243068196).jpg" },
    { name: "Yekatit 12 Monument", filename: "Yekatit_12_Monument_Addis_Ababa.jpg" },
    { name: "Entoto Natural Park", filename: "Addis_Ababa_from_Entoto_Mountains.jpg" },
    { name: "Sheger Riverside Park", filename: "AddisView.jpg" },
    { name: "Entoto Maryam Church area", filename: "Iglesia_de_Entoto_Maryam,_Adís_Abeba,_Etiopía,_2024-01-19,_DD_01.jpg" },
    { name: "Mount Entoto viewpoint", filename: "Addis_Ababa_from_Entoto_Mountains.jpg" },
    { name: "Addis Ababa Lion Zoo", filename: "Lion_zoo_Addis_Ababa_3.jpg" },
    { name: "Unity Park Gardens", filename: "Unity_Park_Addis_Ababa_Ethiopia_1.jpg" },
    { name: "Merkato Market", filename: "Addis_Mercato,_Adís_Abeba,_Etiopía,_2024-01-19,_DD_27.jpg" },
    { name: "Piazza Market Area", filename: "Street_Scene_-_Piazza_District_-_Addis_Ababa_-_Ethiopia_(8659539441).jpg" },
    { name: "Tomoca Coffee", filename: "Tomoca_Coffee_House,_Addis_(12585688875).jpg" },
    { name: "Merkato Market Tour", filename: "Addis_Mercato,_Adís_Abeba,_Etiopía,_2024-01-19,_DD_26.jpg" },
    { name: "Coffee Ceremony Experience", filename: "Ethiopian_coffee_ceremony_-_Addis_Ababa.jpg" },
    { name: "Entoto Mountain Tour", filename: "Addis_Ababa_from_Entoto_Mountains.jpg" },
    { name: "Addis Food Tour", filename: "Ethiopian_fasting_platter.jpg" },
    { name: "Historical Addis Walking Tour", filename: "Addis_Ababa_-_Piassa.jpg" },
    { name: "Unity Park Guided Tour", filename: "Unity_Park_Addis_Ababa_Ethiopia_3.jpg" },
    { name: "Addis Nightlife Tour", filename: "Addis_Ababa_at_the_night_time.jpg" },
    { name: "Addis Airport Taxi", filename: "Addis_Abeba_Taxis_(Sam_Effron).jpg" }
];

const data = JSON.parse(fs.readFileSync('tmp/sourced_images_final.json', 'utf8'));

missingItemsPatch.forEach(patch => {
    const item = data.find(d => d.name === patch.name);
    if (item) {
        item.imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${patch.filename}`;
        item.source = "wikimedia";
        item.sourcePageUrl = `https://commons.wikimedia.org/wiki/File:${patch.filename}`;
    }
});

// Update Sheger specifically with Friendship Park image
const sheger = data.find(d => d.name === "Sheger Riverside Park");
if (sheger) {
    sheger.imageUrl = "https://commons.wikimedia.org/wiki/Special:FilePath/AddisView.jpg";
}

fs.writeFileSync('tmp/sourced_images_final.json', JSON.stringify(data, null, 2));
console.log("Updated 19 Wikimedia URLs to Special:FilePath format.");
