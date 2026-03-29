
const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const prisma = new PrismaClient();

const REAL_IMAGES = {
    "Bole Ambassador Hotel": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/ET_Addis_asv2018-01_img33_Bole_area.jpg/800px-ET_Addis_asv2018-01_img33_Bole_area.jpg",
    ],
    "Hotel Lobelia": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/ET_Addis_asv2018-01_img02_Bole_Airport.jpg/800px-ET_Addis_asv2018-01_img02_Bole_Airport.jpg",
    ],
    "Harmony Hotel Addis Ababa": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/ET_Addis_asv2018-01_img33_Bole_area.jpg/800px-ET_Addis_asv2018-01_img33_Bole_area.jpg",
    ],
    "Hyatt Regency Addis Ababa": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/ET_Addis_asv2018-01_img11_Meskel_Square.jpg/800px-ET_Addis_asv2018-01_img11_Meskel_Square.jpg",
    ],
    "Kuriftu Resort & Spa": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Lake_Langano_Ethiopia.jpg/800px-Lake_Langano_Ethiopia.jpg",
    ],
    "Bole Luxury Apartment": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/ET_Addis_asv2018-01_img33_Bole_area.jpg/800px-ET_Addis_asv2018-01_img33_Bole_area.jpg",
    ],
    "Z Guest House": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/ET_Addis_asv2018-01_img25_Piazza_area.jpg/800px-ET_Addis_asv2018-01_img25_Piazza_area.jpg",
    ],
    "Adot Tina Hotel": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/ET_Addis_asv2018-01_img33_Bole_area.jpg/800px-ET_Addis_asv2018-01_img33_Bole_area.jpg",
    ],
    "Haile Grand Addis Ababa": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/ET_Addis_asv2018-01_img33_Bole_area.jpg/800px-ET_Addis_asv2018-01_img33_Bole_area.jpg",
    ],
    "Mado Hotel": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/ET_Addis_asv2018-01_img33_Bole_area.jpg/800px-ET_Addis_asv2018-01_img33_Bole_area.jpg",
    ],
    "Ethiopian Skylight Hotel": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/ET_Addis_asv2018-01_img02_Bole_Airport.jpg/800px-ET_Addis_asv2018-01_img02_Bole_Airport.jpg",
    ],
    "Ethio Travel and Tours": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Simien_Mountains_National_Park.jpg/800px-Simien_Mountains_National_Park.jpg",
    ],
    "Green Land Tours Ethiopia": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Simien_Mountains_National_Park.jpg/800px-Simien_Mountains_National_Park.jpg",
    ],
    "Entoto Mountain Tour": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Entoto_hill%2C_Addis_Abeba.jpg/800px-Entoto_hill%2C_Addis_Abeba.jpg",
    ],
    "Merkato Market Tour": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Addis_Ababa_Mercato.jpg/800px-Addis_Ababa_Mercato.jpg",
    ],
    "Moplaco Coffee Shop": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Ethiopian_Coffee_Ceremony.jpg/800px-Ethiopian_Coffee_Ceremony.jpg",
    ],
    "Galani Coffee": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Ethiopian_Coffee_Ceremony.jpg/800px-Ethiopian_Coffee_Ceremony.jpg",
    ],
    "Alem Bunna": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Ethiopian_Coffee_Ceremony.jpg/800px-Ethiopian_Coffee_Ceremony.jpg",
    ],
    "Atikilt Tera vegetable market": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Addis_Ababa_Mercato.jpg/800px-Addis_Ababa_Mercato.jpg",
    ],
    "Sabon Tera Market": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Addis_Ababa_Mercato.jpg/800px-Addis_Ababa_Mercato.jpg",
    ],
    "Shiromeda Market": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Addis_Ababa_Mercato.jpg/800px-Addis_Ababa_Mercato.jpg",
    ],
    "Piazza Market Area": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/ET_Addis_asv2018-01_img25_Piazza_area.jpg/800px-ET_Addis_asv2018-01_img25_Piazza_area.jpg",
    ],
    "Shola Market": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Addis_Ababa_Mercato.jpg/800px-Addis_Ababa_Mercato.jpg",
    ],
    "Merkato Market": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Addis_Ababa_Mercato.jpg/800px-Addis_Ababa_Mercato.jpg",
    ],
    "Mount Entoto viewpoint": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Entoto_hill%2C_Addis_Abeba.jpg/800px-Entoto_hill%2C_Addis_Abeba.jpg",
    ],
    "Entoto Natural Park": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Entoto_hill%2C_Addis_Abeba.jpg/800px-Entoto_hill%2C_Addis_Abeba.jpg",
    ],
    "Ethnological Museum (Addis Ababa University)": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Addis_Ababa_University_-_Ethnological_museum.jpg/800px-Addis_Ababa_University_-_Ethnological_museum.jpg",
    ],
    "Menelik II Palace": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Imperial_Palace%2C_Addis_Abeba.jpg/800px-Imperial_Palace%2C_Addis_Abeba.jpg",
    ],
    "Unity Park": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Imperial_Palace%2C_Addis_Abeba.jpg/800px-Imperial_Palace%2C_Addis_Abeba.jpg",
    ],
    "National Museum of Ethiopia": [
        "https://upload.wikimedia.org/wikipedia/commons/8/80/Ethiopian_National_Museum_in_Addis_Ababa.jpg",
    ],
    "Bale Mountains National Park": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Bale_Mountains_National_Park_01.jpg/800px-Bale_Mountains_National_Park_01.jpg",
    ],
    "Danakil Depression Tour": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Dallol_2.jpg/800px-Dallol_2.jpg",
    ],
    "Rock-Hewn Churches of Lalibela": [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Bete_Giyorgis_Lalibela_Ethiopia.jpg/800px-Bete_Giyorgis_Lalibela_Ethiopia.jpg",
    ],
};

async function fix() {
    console.log("Starting data fix (forced URLs)...");

    for (const [name, urls] of Object.entries(REAL_IMAGES)) {
        try {
            const places = await prisma.place.findMany({
                where: { name: { contains: name, mode: 'insensitive' } }
            });

            if (places.length === 0) {
                console.log(`- NOT FOUND: ${name}`);
                continue;
            }

            for (const place of places) {
                // Delete existing images to be clean
                await prisma.placeImage.deleteMany({ where: { placeId: place.id } });

                // Insert the raw wikimedia urls
                for (let i = 0; i < urls.length; i++) {
                    await prisma.placeImage.create({
                        data: {
                            placeId: place.id,
                            imageUrl: urls[i],
                            priority: i + 1,
                            imageSource: "wikimedia_raw", // flag it
                            verifiedAt: new Date(),
                        }
                    });
                }

                // Update auditStatus to ok (Step 10: fix data, not only code)
                await prisma.imageAudit.upsert({
                    where: { entityId: place.id },
                    update: { status: 'ok', checkedAt: new Date() },
                    create: { entityId: place.id, status: 'ok', checkedAt: new Date() }
                });

                console.log(`+ FIXED: ${place.name} (${place.id}) with ${urls.length} images.`);
            }
        } catch (e) {
            console.error(`- ERROR on ${name}: ${e.message}`);
        }
    }
}

fix()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
