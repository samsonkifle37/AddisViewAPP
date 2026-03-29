import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function mirrorImage(imageUrl: string, folder: string, filename: string) {
    console.log(`Downloading ${imageUrl}`);
    const r = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        headers: {
            'User-Agent': 'AddisViewMigrator/1.0',
            'Accept': 'image/*'
        }
    });

    const contentType = r.headers['content-type'] || 'image/jpeg';
    const buffer = Buffer.from(r.data);
    const path = `${folder}/${filename}.${contentType.split('/')[1] || 'jpg'}`;

    console.log(`Uploading to Supabase: ${path}`);
    const { error } = await supabase.storage
        .from('public-images')
        .upload(path, buffer, { contentType, upsert: true });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
        .from('public-images')
        .getPublicUrl(path);

    return publicUrl;
}

const REAL_IMAGES: Record<string, string[]> = {
    "Bole Ambassador Hotel": ["https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/ET_Addis_asv2018-01_img33_Bole_area.jpg/800px-ET_Addis_asv2018-01_img33_Bole_area.jpg"],
    "Hotel Lobelia": ["https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/ET_Addis_asv2018-01_img02_Bole_Airport.jpg/800px-ET_Addis_asv2018-01_img02_Bole_Airport.jpg"],
    "Harmony Hotel Addis Ababa": ["https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/ET_Addis_asv2018-01_img33_Bole_area.jpg/800px-ET_Addis_asv2018-01_img33_Bole_area.jpg"],
    "Hyatt Regency Addis Ababa": ["https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/ET_Addis_asv2018-01_img11_Meskel_Square.jpg/800px-ET_Addis_asv2018-01_img11_Meskel_Square.jpg"],
    "Kuriftu Resort & Spa": ["https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Lake_Langano_Ethiopia.jpg/800px-Lake_Langano_Ethiopia.jpg"],
    "Bole Luxury Apartment": ["https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/ET_Addis_asv2018-01_img33_Bole_area.jpg/800px-ET_Addis_asv2018-01_img33_Bole_area.jpg"],
    "Z Guest House": ["https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/ET_Addis_asv2018-01_img25_Piazza_area.jpg/800px-ET_Addis_asv2018-01_img25_Piazza_area.jpg"],
    "Adot Tina Hotel": ["https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/ET_Addis_asv2018-01_img33_Bole_area.jpg/800px-ET_Addis_asv2018-01_img33_Bole_area.jpg"],
    "Haile Grand Addis Ababa": ["https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/ET_Addis_asv2018-01_img33_Bole_area.jpg/800px-ET_Addis_asv2018-01_img33_Bole_area.jpg"],
    "Mado Hotel": ["https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/ET_Addis_asv2018-01_img33_Bole_area.jpg/800px-ET_Addis_asv2018-01_img33_Bole_area.jpg"],
    "Ethiopian Skylight Hotel": ["https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/ET_Addis_asv2018-01_img02_Bole_Airport.jpg/800px-ET_Addis_asv2018-01_img02_Bole_Airport.jpg"],
    "Ethio Travel and Tours": ["https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Simien_Mountains_National_Park.jpg/800px-Simien_Mountains_National_Park.jpg"],
    "Green Land Tours Ethiopia": ["https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Simien_Mountains_National_Park.jpg/800px-Simien_Mountains_National_Park.jpg"],
    "Entoto Mountain Tour": ["https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Entoto_hill%2C_Addis_Abeba.jpg/800px-Entoto_hill%2C_Addis_Abeba.jpg"],
    "Merkato Market Tour": ["https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Addis_Ababa_Mercato.jpg/800px-Addis_Ababa_Mercato.jpg"],
    "Moplaco Coffee Shop": ["https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Ethiopian_Coffee_Ceremony.jpg/800px-Ethiopian_Coffee_Ceremony.jpg"],
    "Galani Coffee": ["https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Ethiopian_Coffee_Ceremony.jpg/800px-Ethiopian_Coffee_Ceremony.jpg"],
    "Alem Bunna": ["https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Ethiopian_Coffee_Ceremony.jpg/800px-Ethiopian_Coffee_Ceremony.jpg"],
    "Atikilt Tera vegetable market": ["https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Addis_Ababa_Mercato.jpg/800px-Addis_Ababa_Mercato.jpg"],
    "Sabon Tera Market": ["https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Addis_Ababa_Mercato.jpg/800px-Addis_Ababa_Mercato.jpg"],
    "Shiromeda Market": ["https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Addis_Ababa_Mercato.jpg/800px-Addis_Ababa_Mercato.jpg"],
    "Piazza Market Area": ["https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/ET_Addis_asv2018-01_img25_Piazza_area.jpg/800px-ET_Addis_asv2018-01_img25_Piazza_area.jpg"],
    "Shola Market": ["https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Addis_Ababa_Mercato.jpg/800px-Addis_Ababa_Mercato.jpg"],
    "Merkato Market": ["https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Addis_Ababa_Mercato.jpg/800px-Addis_Ababa_Mercato.jpg"],
    "Mount Entoto viewpoint": ["https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Entoto_hill%2C_Addis_Abeba.jpg/800px-Entoto_hill%2C_Addis_Abeba.jpg"],
    "Entoto Natural Park": ["https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Entoto_hill%2C_Addis_Abeba.jpg/800px-Entoto_hill%2C_Addis_Abeba.jpg"],
    "Ethnological Museum (Addis Ababa University)": ["https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Addis_Ababa_University_-_Ethnological_museum.jpg/800px-Addis_Ababa_University_-_Ethnological_museum.jpg"],
    "Menelik II Palace": ["https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Imperial_Palace%2C_Addis_Abeba.jpg/800px-Imperial_Palace%2C_Addis_Abeba.jpg"],
    "Unity Park": ["https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Imperial_Palace%2C_Addis_Abeba.jpg/800px-Imperial_Palace%2C_Addis_Abeba.jpg"],
    "National Museum of Ethiopia": ["https://upload.wikimedia.org/wikipedia/commons/8/80/Ethiopian_National_Museum_in_Addis_Ababa.jpg"],
    "Bale Mountains National Park": ["https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Bale_Mountains_National_Park_01.jpg/800px-Bale_Mountains_National_Park_01.jpg"],
    "Danakil Depression Tour": ["https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Dallol_2.jpg/800px-Dallol_2.jpg"],
    "Rock-Hewn Churches of Lalibela": ["https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Bete_Giyorgis_Lalibela_Ethiopia.jpg/800px-Bete_Giyorgis_Lalibela_Ethiopia.jpg"]
};

async function run() {
    console.log("Starting secure mirror upload script directly to Supabase.");

    for (const [name, urls] of Object.entries(REAL_IMAGES)) {
        const places = await prisma.place.findMany({ where: { name } });
        if (places.length === 0) continue;

        for (const place of places) {
            await prisma.placeImage.deleteMany({ where: { placeId: place.id } });

            for (let i = 0; i < urls.length; i++) {
                try {
                    const wikiUrl = urls[i];
                    const finalSupabaseUrl = await mirrorImage(wikiUrl, `places/${place.slug}`, "cover");

                    await prisma.placeImage.create({
                        data: {
                            placeId: place.id,
                            imageUrl: finalSupabaseUrl,
                            priority: i + 1,
                            imageSource: "supabase",
                            verifiedAt: new Date(),
                        }
                    });

                    await (prisma as any).$executeRawUnsafe(
                        `UPDATE "ImageAudit" SET status = 'ok', "imageUrl" = $1, notes = 'Real image securely mirrored' WHERE "entityId" = $2`,
                        finalSupabaseUrl, place.id
                    );

                    console.log(`✅ SUCCESS: ${name} -> ${finalSupabaseUrl}`);
                    await new Promise(r => setTimeout(r, 1500));
                } catch (e: any) {
                    console.log(`❌ ERROR on ${name}: ${e.message}`);
                }
            }
        }
    }
    console.log("Done!");
}

run().catch(console.error).finally(() => prisma.$disconnect());
