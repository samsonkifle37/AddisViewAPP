import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function audit() {
    console.log("=== NU DATASET AUDIT REPORT ===\n");

    const totalPlaces = await prisma.place.count({ where: { status: 'APPROVED' } });

    // Category Distribution
    const cats = await prisma.place.groupBy({ by: ['type'], _count: { id: true }, where: { status: 'APPROVED' } });

    // Completeness
    const withImages = await prisma.place.count({ where: { status: 'APPROVED', images: { some: {} } } });
    const withPhone = await prisma.place.count({ where: { status: 'APPROVED', phone: { not: null } } });
    const withCoords = await prisma.place.count({ where: { status: 'APPROVED', latitude: { not: null }, longitude: { not: null } } });
    const withWebsite = await prisma.place.count({ where: { status: 'APPROVED', websiteUrl: { not: null } } });

    // Score Distributions
    const scores = await prisma.place.findMany({ select: { verificationScore: true, visualScore: true }, where: { status: 'APPROVED' } });
    const vSc = { high: 0, med: 0, low: 0 };
    const vis = { high: 0, med: 0, low: 0 };

    scores.forEach(s => {
        if (s.verificationScore >= 70) vSc.high++;
        else if (s.verificationScore >= 40) vSc.med++;
        else vSc.low++;
        
        if (s.visualScore >= 70) vis.high++;
        else if (s.visualScore >= 40) vis.med++;
        else vis.low++;
    });

    // Source Diversity
    const sources = await prisma.placeSource.groupBy({ by: ['sourceName'], _count: { id: true } });

    // Geographic Analysis (Addis bounds roughly Lat 8.8-9.1, Lng 38.6-38.9)
    const outOfBounds = await prisma.place.findMany({
        where: {
            status: 'APPROVED',
            OR: [
                { latitude: { lt: 8.7 } },
                { latitude: { gt: 9.3 } },
                { longitude: { lt: 38.5 } },
                { longitude: { gt: 39.0 } },
            ]
        },
        select: { id: true, name: true, latitude: true, longitude: true }
    });

    // Duplicate Candidates
    const dupes = await prisma.duplicateCandidate.groupBy({ by: ['status'], _count: { id: true } });

    // Problematic Listings (High Score but no coords/phone, or Low Score but many images)
    const problematic = await prisma.place.findMany({
        where: {
            status: 'APPROVED',
            verificationScore: { gt: 50 },
            latitude: null,
            longitude: null
        },
        select: { id: true, name: true, verificationScore: true }
    });

    let out = `=== NU DATASET AUDIT REPORT ===\n\n`;
    out += `Total Approved Places: ${totalPlaces}\n\n`;

    out += `Category Coverage:\n`;
    cats.forEach(c => out += ` - ${c.type}: ${c._count.id}\n`);

    out += `\nCompleteness Metrics:\n`;
    out += ` - Images: ${((withImages/Math.max(1, totalPlaces))*100).toFixed(1)}%\n`;
    out += ` - Phone: ${((withPhone/Math.max(1, totalPlaces))*100).toFixed(1)}%\n`;
    out += ` - Coordinates: ${((withCoords/Math.max(1, totalPlaces))*100).toFixed(1)}%\n`;
    out += ` - Website: ${((withWebsite/Math.max(1, totalPlaces))*100).toFixed(1)}%\n`;

    out += `\nVerification Score Distribution:\n`;
    out += ` - High (>=70): ${vSc.high} | Med (40-69): ${vSc.med} | Low (<40): ${vSc.low}\n`;
    
    out += `\nVisual Score Distribution:\n`;
    out += ` - High (>=70): ${vis.high} | Med (40-69): ${vis.med} | Low (<40): ${vis.low}\n`;

    out += `\nSource Diversity:\n`;
    sources.forEach((s: any) => out += ` - ${s.sourceName}: ${s._count.id}\n`);

    out += `\nGeographic Out-of-Bounds Candidates (Addis Region): ${outOfBounds.length}\n`;
    outOfBounds.forEach((o: any) => out += ` - ${o.name} (${o.latitude}, ${o.longitude}) [ID:${o.id.substring(0,8)}]\n`);

    out += `\nDuplicate Candidates Status:\n`;
    dupes.forEach((d: any) => out += ` - ${d.status}: ${d._count.id}\n`);

    out += `\nProblematic Listings (High Trust but Missing Loc/Coords): ${problematic.length}\n`;
    problematic.slice(0, 5).forEach((p: any) => out += ` - ${p.name} [ID:${p.id.substring(0,8)}]\n`);
    
    require('fs').writeFileSync('tmp/audit_log.txt', out);
    console.log("Audit log written to tmp/audit_log.txt");

    await prisma.$disconnect();
    pool.end();
}

audit();
