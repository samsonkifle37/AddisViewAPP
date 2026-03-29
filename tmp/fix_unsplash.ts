import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function run() {
    console.log("Fixing Unsplash images marked as place_real...");

    // 1. Force all Unsplash imagery to be either representative or placeholder
    const unsplashImages = await prisma.placeImage.findMany({
        where: { imageUrl: { contains: 'unsplash.com' } },
        include: { place: true }
    });

    console.log(`Found ${unsplashImages.length} Unsplash images overall.`);

    let fixedTruthCount = 0;
    let quarantinedStaysCount = 0;

    for (const img of unsplashImages) {
        if (img.imageTruthType === 'place_real') {
            await prisma.placeImage.update({
                where: { id: img.id },
                data: { imageTruthType: 'representative' }
            });
            fixedTruthCount++;
        }

        // 2. Quarantine Unsplash images if they belong to a hotel (No synthetics for stays)
        if (img.place && ['hotel', 'guesthouse', 'apartment', 'resort', 'lodge'].includes(img.place.type)) {
            if (img.status !== 'REJECTED') {
                await prisma.placeImage.update({
                    where: { id: img.id },
                    data: {
                        status: 'REJECTED',
                        imageTruthType: 'placeholder',
                        rejectionReason: 'NO_STOCK_FOR_STAYS'
                    }
                });
                quarantinedStaysCount++;
            }
        }
    }

    console.log(`Fixed truth type for ${fixedTruthCount} Unsplash images.`);
    console.log(`Quarantined ${quarantinedStaysCount} stock images from Stays.`);
}

run().finally(() => prisma.$disconnect());
