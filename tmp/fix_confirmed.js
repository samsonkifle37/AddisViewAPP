
const CONFIRMED_URLS = {
    "Bole Ambassador Hotel": ["https://ambassadorhotelethiopia.com/wp-content/uploads/2021/01/appartment-rooms-1024x683.jpg"],
    "Hotel Lobelia": ["https://www.hotellobeliaaddis.com/img/home-about/home-about.png"],
    "Harmony Hotel Addis Ababa": ["https://admin.harmonyhotelethiopia.com/public/storage/accommodation/1768833811.jpg"],
    "Hyatt Regency Addis Ababa": ["https://addisvenues.com/wp-content/uploads/2021/04/Hyatt-Regency-Addis-Ababa.jpg"],
    "Kuriftu Resort & Spa": ["https://upload.wikimedia.org/wikipedia/commons/1/1a/Kuriftu_Resort_in_Bishoftu_Ethiopia.jpg"],
    "Ethiopian Skylight Hotel": ["https://upload.wikimedia.org/wikipedia/commons/e/e0/Ethiopian_Skylight_Hotel.jpg"],
    "National Museum of Ethiopia": ["https://upload.wikimedia.org/wikipedia/commons/5/55/National_museum_of_Ethiopia_New_facility.JPG"],
    "Menelik II Palace": ["https://upload.wikimedia.org/wikipedia/commons/3/3d/Palacio_de_Menelik_II%2C_Ad%C3%ADs_Abeba%2C_Etiop%C3%ADa%2C_2024-01-19%2C_DD_03.jpg"],
    "Unity Park": ["https://upload.wikimedia.org/wikipedia/commons/3/33/Unity_Park_Addis_Ababa_Ethiopia_3.jpg"],
    "Rock-Hewn Churches of Lalibela": ["https://upload.wikimedia.org/wikipedia/commons/2/23/Rock-Hewn_Churches%2C_Lalibela_Ethiopia_%281%29.jpg"]
};

async function fixConfirmed() {
    console.log("Injecting 10 confirmed real URLs...");
    for (const [name, urls] of Object.entries(CONFIRMED_URLS)) {
        const res = await fetch("http://localhost:3000/api/admin/images/replace-all", {
            method: "POST",
            body: JSON.stringify({ name, urls })
        });
        const data = await res.json();
        console.log(`- ${name}: ${data.fixed} updated. Status: ${res.status}`);
        if (!data.success) console.error(data.error);
    }
}

fixConfirmed();
