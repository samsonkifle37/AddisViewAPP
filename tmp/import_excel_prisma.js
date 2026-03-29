const xlsx = require('xlsx');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function mapType(cat, sub) {
    cat = cat ? cat.toUpperCase() : '';
    sub = sub ? sub.toLowerCase() : '';

    if (sub.includes('museum')) return 'museum';
    if (sub.includes('park')) return 'park';
    if (sub.includes('market')) return 'market';
    if (sub.includes('coffee')) return 'coffee';
    if (cat === 'STAY') return 'hotel';
    if (cat === 'EAT & DRINK') return 'restaurant';
    if (sub.includes('church') || sub.includes('cathedral') || sub.includes('monument')) return 'museum';

    return 'tour';
}

async function run() {
    try {
        const filePath = path.join(__dirname, '../lists/addisview_master_database_builder_pack.xlsx');
        const workbook = xlsx.readFile(filePath);

        // 1. Process Places (verified_seed)
        const placesSheet = workbook.Sheets['verified_seed'];
        const places = xlsx.utils.sheet_to_json(placesSheet);

        let placesAdded = 0;
        let placesUpdated = 0;

        for (const p of places) {
            if (!p.name) continue;

            const slug = generateSlug(p.name);
            const type = mapType(p.category, p.sub_category);

            const description = p.seo_description || p.notes || '';
            const location = p.area || p.city || 'Addis Ababa';

            const lat = typeof p.latitude === 'number' ? p.latitude : undefined;
            const lng = typeof p.longitude === 'number' ? p.longitude : undefined;

            const website = p.website || p.source_url || undefined;

            const existing = await prisma.place.findFirst({ where: { name: p.name } });

            if (existing) {
                await prisma.place.update({
                    where: { id: existing.id },
                    data: {
                        type,
                        description: description || undefined,
                        location: location || undefined,
                        latitude: lat,
                        longitude: lng,
                        website
                    }
                });
                placesUpdated++;
            } else {
                try {
                    await prisma.place.create({
                        data: {
                            name: p.name,
                            slug: slug,
                            type,
                            description: description || undefined,
                            location: location || undefined,
                            latitude: lat,
                            longitude: lng,
                            website
                        }
                    });
                    placesAdded++;
                } catch (err) {
                    console.error("Error creating place:", p.name, err.message);
                }
            }
        }

        console.log(`Places: Added ${placesAdded}, Updated ${placesUpdated}`);

        // 2. Process Tours
        const toursSheet = workbook.Sheets['tour_packages'];
        if (toursSheet) {
            const tours = xlsx.utils.sheet_to_json(toursSheet);
            let toursAdded = 0;
            let toursUpdated = 0;

            for (const t of tours) {
                if (!t.package_name) continue;

                const name = t.package_name;
                const slug = generateSlug(name) + '-tour';
                const description = t.summary || '';
                const location = t.core_stops ? `Stops: ${t.core_stops}` : 'Addis Ababa';
                const price = t.starting_price || undefined;
                const website = t.source_url || undefined;

                const existing = await prisma.place.findFirst({ where: { name } });
                if (existing) {
                    await prisma.place.update({
                        where: { id: existing.id },
                        data: {
                            description: description || undefined,
                            location: location || undefined,
                            price,
                            website
                        }
                    });
                    toursUpdated++;
                } else {
                    try {
                        await prisma.place.create({
                            data: {
                                name,
                                slug: slug,
                                type: 'tour',
                                description: description || undefined,
                                location: location || undefined,
                                price,
                                website
                            }
                        });
                        toursAdded++;
                    } catch (err) {
                        console.error(`Error creating tour: ${name}`, err.message);
                    }
                }
            }
            console.log(`Tours: Added ${toursAdded}, Updated ${toursUpdated}`);
        }

    } catch (e) {
        console.error("Failed to import:", e);
    } finally {
        await prisma.$disconnect();
    }
}

run();
