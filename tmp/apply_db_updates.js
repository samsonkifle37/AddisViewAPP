const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const dbUrl = process.env.DATABASE_URL;

async function applyUpdates() {
    const pg = new Client({ connectionString: dbUrl });
    await pg.connect();
    console.log("Connected to database for updates");

    try {
        // 1. Remove ETT Tours Ethiopia
        console.log("Removing 'ETT Tours Ethiopia'...");
        let res = await pg.query(`DELETE FROM "Place" WHERE name ILIKE '%ETT Tours Ethiopia%'`);
        console.log(`Deleted ${res.rowCount} record(s).`);

        // 2. Rename Addis Food Tour to Afro Ethiopia tour
        console.log("Renaming 'Addis Food Tour'...");
        res = await pg.query(`UPDATE "Place" SET name = 'Afro Ethiopia tour' WHERE name ILIKE '%Addis Food Tour%'`);
        console.log(`Updated ${res.rowCount} record(s).`);

        // 3. Rename Sabon Tera Market to AbealTibeb Shromeda
        console.log("Renaming 'Sabon Tera Market'...");
        res = await pg.query(`UPDATE "Place" SET name = 'AbealTibeb Shromeda' WHERE name ILIKE '%Sabon Tera Market%'`);
        console.log(`Updated ${res.rowCount} record(s).`);

        // 4. Remove duplicate Entoto Natural Park
        console.log("Handling duplicate 'Entoto Natural Park'...");
        res = await pg.query(`SELECT id FROM "Place" WHERE name ILIKE '%Entoto Natural Park%' ORDER BY "createdAt" ASC`);

        if (res.rows.length > 1) {
            // Keep the first one, delete the rest
            const keepId = res.rows[0].id;
            const duplicateIds = res.rows.slice(1).map(r => r.id);
            console.log(`Found ${res.rows.length} records. Keeping ${keepId}, deleting ${duplicateIds.join(', ')}`);

            await pg.query(`DELETE FROM "Place" WHERE id = ANY($1)`, [duplicateIds]);
            console.log("Deleted duplicates.");
        } else {
            console.log(`Found ${res.rows.length} record(s). No duplicates to delete.`);
        }

    } catch (e) {
        console.error("Error during updates:", e.message);
    } finally {
        await pg.end();
    }
}

applyUpdates();
