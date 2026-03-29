import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function run() {
    console.log("Finding duplicated cross-place images...");
    
    // We want to find images where the SAME exact URL appears in multiple distinct Place records
    const duplicates = await prisma.$queryRaw<any[]>`
        SELECT "imageUrl", count(DISTINCT "placeId") as place_count
        FROM "PlaceImage"
        GROUP BY "imageUrl"
        HAVING count(DISTINCT "placeId") > 1
    `;

    console.log(`Found ${duplicates.length} image URLs assigned to multiple places.`);

    let fixedCount = 0;

    for (const row of duplicates) {
        if (!row.imageUrl) continue;
        
        // Fetch all images with this URL, ordered so that higher verification score places come first
        const imgs = await prisma.placeImage.findMany({
            where: { imageUrl: row.imageUrl },
            orderBy: { place: { verificationScore: 'desc' } },
            include: { place: true }
        });

        const seenPlaces = new Set();
        let primaryPlaceId: string | null = null;
        
        for (const img of imgs) {
            if (!primaryPlaceId) {
                // The first seen place becomes the distinct owner of this image
                primaryPlaceId = img.placeId;
                seenPlaces.add(primaryPlaceId);
                continue;
            }

            if (img.placeId !== primaryPlaceId && !seenPlaces.has(img.placeId)) {
                // Belong to another place! Block it so it doesn't show up.
                await prisma.placeImage.update({
                    where: { id: img.id },
                    data: {
                        status: 'REJECTED',
                        imageTruthType: 'placeholder',
                        rejectionReason: 'DUPLICATE_CROSS_PLACE'
                    }
                });
                seenPlaces.add(img.placeId);
                fixedCount++;
            } else if (img.placeId !== primaryPlaceId && seenPlaces.has(img.placeId)) {
                // Secondary image inside another already processed place
                await prisma.placeImage.update({
                    where: { id: img.id },
                    data: {
                        status: 'REJECTED',
                        imageTruthType: 'placeholder',
                        rejectionReason: 'DUPLICATE_CROSS_PLACE'
                    }
                });
                fixedCount++;
            }
        }
    }

    console.log(`Deduplication complete! Quarantined ${fixedCount} duplicated images.`);
}

run().finally(() => prisma.$disconnect());
