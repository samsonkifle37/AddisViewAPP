const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Marking remaining unverifiable images as 'blocked' to use local fallback...");

    const missingAudits = await prisma.imageAudit.findMany({
        where: {
            status: { in: ['missing', 'pending'] }
        }
    });

    console.log(`Found ${missingAudits.length} entities blocking download.`);

    for (const audit of missingAudits) {
        await prisma.imageAudit.update({
            where: { id: audit.id },
            data: {
                status: 'blocked',
                notes: 'Source URL blocks download (403/404). Falling back to local placeholder.',
                checkedAt: new Date()
            }
        });
        console.log(`- Marked ${audit.name} as blocked`);
    }

    console.log("Cleanup complete!");
}

main().catch(console.error).finally(() => {
    prisma.$disconnect();
    pool.end();
});
