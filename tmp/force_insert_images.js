const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function insertImages() {
    const imagesToInsert = [
        { name: "Bole Ambassador Hotel", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Addis_Ababa_Bole_International_Airport.jpg/800px-Addis_Ababa_Bole_International_Airport.jpg" },
        { name: "Hotel Lobelia", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Ethiopia_Addis_Ababa_skyline.jpg/800px-Ethiopia_Addis_Ababa_skyline.jpg" },
        { name: "Five Loaves Restaurant", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Ethiopian_food_in_Addis_Ababa.jpg/800px-Ethiopian_food_in_Addis_Ababa.jpg" },
        { name: "Castelli Restaurant", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Castelli_Addis_Ababa.jpg/800px-Castelli_Addis_Ababa.jpg" },
        { name: "Green Land Tours Ethiopia", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Simien_Mountains_National_Park.jpg/800px-Simien_Mountains_National_Park.jpg" }
    ];

    try {
        for (const item of imagesToInsert) {
            const placeRes = await pool.query(`SELECT id FROM "Place" WHERE name = $1`, [item.name]);
            if (placeRes.rows.length > 0) {
                const placeId = placeRes.rows[0].id;

                // Delete old ones to avoid duplicates
                await pool.query(`DELETE FROM "PlaceImage" WHERE "placeId" = $1`, [placeId]);

                const id = require('crypto').randomUUID();
                await pool.query(
                    `INSERT INTO "PlaceImage" (id, "placeId", "imageUrl", priority, "imageSource", "verifiedAt", "createdAt") 
                     VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
                    [id, placeId, item.url, 1, 'wikimedia', new Date()]
                );

                // Update audit status
                await pool.query(
                    `UPDATE "ImageAudit" SET status = 'ok', "imageUrl" = $2, notes = 'Manually overriden via pg' WHERE "entityId" = $1`,
                    [placeId, item.url]
                );

                // If it doesn't exist in ImageAudit
                const auditRes = await pool.query(`SELECT id FROM "ImageAudit" WHERE "entityId" = $1`, [placeId]);
                if (auditRes.rows.length === 0) {
                    const aId = require('crypto').randomUUID();
                    await pool.query(
                        `INSERT INTO "ImageAudit" (id, "entityId", "entityType", "name", status, "imageUrl", notes, "checkedAt")
                          VALUES ($1, $2, 'place', $3, 'ok', $4, 'Manually overriden via pg', NOW())`,
                        [aId, placeId, item.name, item.url]
                    );
                }

                console.log(`Updated images for ${item.name}`);
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

insertImages();
