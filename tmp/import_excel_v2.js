const xlsx = require('xlsx');
const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

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
    const pg = new Client({ connectionString: process.env.DATABASE_URL });
    await pg.connect();

    console.log("Connected to DB.");

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
            const area = p.area || '';
            const city = p.city || 'Addis Ababa';
            const country = p.country || 'Ethiopia';

            const lat = typeof p.latitude === 'number' ? p.latitude : null;
            const lng = typeof p.longitude === 'number' ? p.longitude : null;
            const website = p.website || p.source_url || null;

            // Check if exists
            const res = await pg.query(`SELECT id FROM "Place" WHERE name = $1`, [p.name]);
            if (res.rows.length > 0) {
                // Update
                await pg.query(
                    `UPDATE "Place" SET type = $1, "shortDescription" = $2, area = $3, city = $4, country = $5, latitude = $6, longitude = $7, "websiteUrl" = $8, source = 'master_list' WHERE id = $9`,
                    [type, description, area, city, country, lat, lng, website, res.rows[0].id]
                );
                placesUpdated++;
            } else {
                // Insert
                await pg.query(
                    `INSERT INTO "Place" (id, name, slug, type, "shortDescription", area, city, country, latitude, longitude, "websiteUrl", source, status, "isActive", "createdAt", "updatedAt") 
                     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'master_list', 'APPROVED', true, NOW(), NOW())`,
                    [p.name, slug, type, description, area, city, country, lat, lng, website]
                );
                placesAdded++;
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
                const area = t.core_stops ? `Stops: ${t.core_stops}` : '';
                const city = 'Addis Ababa';
                const country = 'Ethiopia';
                const priceLevel = t.starting_price || null;
                const websiteUrl = t.source_url || null;

                const res = await pg.query(`SELECT id FROM "Place" WHERE name = $1`, [name]);
                if (res.rows.length > 0) {
                    await pg.query(
                        `UPDATE "Place" SET "shortDescription" = $1, area = $2, "priceLevel" = $3, "bookingUrl" = $4 WHERE id = $5`,
                        [description, area, priceLevel, websiteUrl, res.rows[0].id]
                    );
                    toursUpdated++;
                } else {
                    await pg.query(
                        `INSERT INTO "Place" (id, name, slug, type, "shortDescription", area, city, country, "priceLevel", "bookingUrl", source, status, "isActive", "createdAt", "updatedAt") 
                         VALUES (gen_random_uuid(), $1, $2, 'tour', $3, $4, $5, $6, $7, $8, 'master_list', 'APPROVED', true, NOW(), NOW())`,
                        [name, slug, description, area, city, country, priceLevel, websiteUrl]
                    );
                    toursAdded++;
                }
            }
            console.log(`Tours: Added ${toursAdded}, Updated ${toursUpdated}`);
        }

    } catch (e) {
        console.error("Failed to import:", e);
    } finally {
        await pg.end();
    }
}

run();
