import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function run() {
    console.log("Removing fake representative imagery for Hotels and Stays...");

    // Find all 'representative' images that belong to hotel-like places.
    const fakeImages = await prisma.placeImage.findMany({
        where: {
            imageTruthType: 'representative',
            place: {
                type: {
                    in: ['hotel', 'guesthouse', 'apartment', 'resort', 'lodge'] // all stay types
                }
            }
        },
        include: { place: true }
    });

    console.log(`Found ${fakeImages.length} fake representative images for stays. Quarantining...`);

    let updatedCount = 0;
    for (const img of fakeImages) {
        // Change status to REJECTED so they are ignored, or set truthType to placeholder
        await prisma.placeImage.update({
            where: { id: img.id },
            data: {
                status: 'REJECTED',
                imageTruthType: 'placeholder',
                rejectionReason: 'STRICT_STAY_REPRESENTATIVE_POLICY'
            }
        });
        updatedCount++;
    }

    console.log(`Successfully quarantined ${updatedCount} misleading hotel images.`);

    // Wait! Now we also need to delete duplicate placeholders visually from Unsplash.
    // If there were any unsplash images not labeled representative but still repeated, let's nuke them.
    const dupes = await prisma.$queryRaw<any[]>`
        SELECT "imageUrl", count(DISTINCT "placeId") as c
        FROM "PlaceImage"
        WHERE "status" != 'REJECTED'
        GROUP BY "imageUrl"
        HAVING count(DISTINCT "placeId") > 1
    `;

    console.log(`Found ${dupes.length} duplicate cross-place URLs still active.`);

    for (const d of dupes) {
        if (!d.imageUrl) continue;
        const imgs = await prisma.placeImage.findMany({
            where: { imageUrl: d.imageUrl, status: { not: 'REJECTED' } },
            orderBy: { place: { verificationScore: 'desc' } }
        });

        let primaryPlaceId: string | null = null;
        for (const img of imgs) {
            if (!primaryPlaceId) {
                primaryPlaceId = img.placeId;
                continue;
            }
            if (img.placeId !== primaryPlaceId) {
                await prisma.placeImage.update({
                    where: { id: img.id },
                    data: {
                        status: 'REJECTED',
                        imageTruthType: 'placeholder',
                        rejectionReason: 'DUPLICATE_CROSS_PLACE'
                    }
                });
            }
        }
    }
}

run().finally(() => prisma.$disconnect());
