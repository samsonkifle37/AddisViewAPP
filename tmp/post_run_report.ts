import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function report() {
    const places = await prisma.place.findMany({
        where: { status: 'APPROVED' },
        include: { images: true }
    });

    const total = places.length;
    let withAtLeastOne = 0;
    let withTwoPlus = 0;

    const maturityBands = {
        zero: 0,
        hero: 0,
        twoToThree: 0,
        thresholdMet: 0,
        gallery: 0
    };

    const categoryMaturity: any = {};
    const thresholdMap: Record<string, number> = {
        hotel: 5, guesthouse: 5, resort: 5, apartment: 5,
        tour: 4, museum: 4, landmark: 4,
        restaurant: 3, cafe: 3, coffee: 3, club: 3, nightlife: 3,
        transport: 2
    };

    places.forEach((p: any) => {
        const approvedImages = p.images.filter((i: any) => i.status === 'APPROVED' && i.imageTruthType === 'place_real').length;
        if (approvedImages >= 1) withAtLeastOne++;
        if (approvedImages >= 2) withTwoPlus++;
        
        const limit = thresholdMap[p.type] || 2;
        
        let band = 'zero';
        if (approvedImages === 1) band = 'hero';
        else if (approvedImages >= 2 && approvedImages < limit) band = 'twoToThree';
        else if (approvedImages >= limit && approvedImages < limit + 5) band = 'thresholdMet';
        else if (approvedImages >= limit + 5) band = 'gallery';
        
        (maturityBands as any)[band]++;

        if (!categoryMaturity[p.type]) categoryMaturity[p.type] = { zero: 0, hero: 0, twoToThree: 0, thresholdMet: 0, total: 0 };
        categoryMaturity[p.type][band] = (categoryMaturity[p.type][band] || 0) + 1;
        categoryMaturity[p.type].total++;
    });

    const percOne = ((withAtLeastOne / total) * 100).toFixed(1);
    const percTwo = ((withTwoPlus / total) * 100).toFixed(1);

    let out = `=== QA REPORT PHASE 5 ===\n\n`;
    out += `Listings with at least 1 approved image: ${percOne}%\n`;
    out += `Listings with 2+ approved images: ${percTwo}%\n\n`;
    out += `Maturity Bands:\n`;
    out += ` - Zero Images: ${maturityBands.zero}\n`;
    out += ` - Hero Only: ${maturityBands.hero}\n`;
    out += ` - 2-3 Images: ${maturityBands.twoToThree}\n`;
    out += ` - Threshold Met: ${maturityBands.thresholdMet}\n`;
    out += ` - Rich Gallery: ${maturityBands.gallery}\n\n`;

    out += `Category Coverage by Visual Maturity (top 5 categories by volume):\n`;
    Object.keys(categoryMaturity).sort((a,b) => categoryMaturity[b].total - categoryMaturity[a].total).slice(0, 5).forEach(c => {
        out += ` - ${c.toUpperCase()} (${categoryMaturity[c].total} places): Zero=${categoryMaturity[c].zero}, Hero=${categoryMaturity[c].hero}, Threshold=${categoryMaturity[c].thresholdMet}\n`;
    });

    require('fs').writeFileSync('tmp/impact_report.txt', out);
    console.log(out);

    await prisma.$disconnect();
    pool.end();
}

report();
