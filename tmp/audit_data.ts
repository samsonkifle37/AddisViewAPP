
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const prisma = new PrismaClient();

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

async function audit() {
    console.log("Starting data audit...");
    const report: any[] = [];

    for (const name of targets) {
        const place = await prisma.place.findFirst({
            where: { name: { contains: name, mode: 'insensitive' } },
            include: { images: true }
        });

        if (!place) {
            report.push({ name, status: "NOT_FOUND" });
            continue;
        }

        const auditItem: any = {
            id: place.id,
            name: place.name,
            type: place.type,
            image_url_field: (place as any).image_url,
            images_count: place.images.length,
            first_image_url: place.images[0]?.imageUrl || "NONE",
            audit_status: "UNKNOWN"
        };

        const imageAudit = await prisma.imageAudit.findFirst({
            where: { entityId: place.id }
        });
        if (imageAudit) {
            auditItem.audit_status = imageAudit.status;
        }

        report.push(auditItem);
    }

    console.table(report);
}

audit()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
