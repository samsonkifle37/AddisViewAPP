import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Hardcoded baseline from pre-Google snapshot
const BASELINE = {
    percOne: 3.4,
    percTwo: 1.6,
    zeroBand: 425,
    heroBand: 8,
    twoThreeBand: 5,
    thresholdBand: 2,
    galleryBand: 0,
    categories: {
        restaurant: { zero: 171, hero: 1, threshold: 1, total: 173 },
        hotel: { zero: 117, hero: 1, threshold: 1, total: 120 },
        coffee: { zero: 43, hero: 0, threshold: 0, total: 43 },
        park: { zero: 27, hero: 2, threshold: 0, total: 29 },
        museum: { zero: 13, hero: 1, threshold: 0, total: 17 },
    } as Record<string, any>
};

async function deltaReport() {
    const places = await prisma.place.findMany({
        where: { status: 'APPROVED' },
        include: { images: true }
    });

    const total = places.length;
    let withAtLeastOne = 0;
    let withTwoPlus = 0;

    const maturityBands = { zero: 0, hero: 0, twoToThree: 0, thresholdMet: 0, gallery: 0 };
    const categoryMaturity: any = {};
    const thresholdMap: Record<string, number> = {
        hotel: 5, guesthouse: 5, resort: 5, apartment: 5,
        tour: 4, museum: 4, landmark: 4,
        restaurant: 3, cafe: 3, coffee: 3, club: 3, nightlife: 3,
        transport: 2
    };

    // Google-specific match tracking
    let googleAutoAttached = 0;
    let googleQueuedForReview = 0;
    let googleRejected = 0;

    places.forEach((p: any) => {
        const realApproved = p.images.filter((i: any) => i.imageTruthType === 'place_real' && i.status === 'APPROVED').length;
        if (realApproved >= 1) withAtLeastOne++;
        if (realApproved >= 2) withTwoPlus++;

        const limit = thresholdMap[p.type] || 2;
        let band = 'zero';
        if (realApproved === 1) band = 'hero';
        else if (realApproved >= 2 && realApproved < limit) band = 'twoToThree';
        else if (realApproved >= limit && realApproved < limit + 5) band = 'thresholdMet';
        else if (realApproved >= limit + 5) band = 'gallery';
        (maturityBands as any)[band]++;

        if (!categoryMaturity[p.type]) categoryMaturity[p.type] = { zero: 0, hero: 0, twoToThree: 0, thresholdMet: 0, total: 0 };
        categoryMaturity[p.type][band] = (categoryMaturity[p.type][band] || 0) + 1;
        categoryMaturity[p.type].total++;

        // Count Google images per place
        const googleImages = p.images.filter((i: any) => i.imageSource === 'google_places');
        const googleApproved = googleImages.filter((i: any) => i.status === 'APPROVED').length;
        const googlePending = googleImages.filter((i: any) => i.status === 'PENDING').length;
        const googleFailed = googleImages.filter((i: any) => i.status === 'FAILED').length;
        googleAutoAttached += googleApproved;
        googleQueuedForReview += googlePending;
        googleRejected += googleFailed;
    });

    const percOne = ((withAtLeastOne / total) * 100).toFixed(1);
    const percTwo = ((withTwoPlus / total) * 100).toFixed(1);
    const deltaOne = (parseFloat(percOne) - BASELINE.percOne).toFixed(1);
    const deltaTwo = (parseFloat(percTwo) - BASELINE.percTwo).toFixed(1);

    // Compute average visualScore
    let totalVS = 0;
    places.forEach((p: any) => totalVS += (p.visualScore || 0));
    const avgVS = (totalVS / total).toFixed(1);

    // Target category uplift
    const targetCategories = ['restaurant', 'cafe', 'club', 'nightlife', 'transport', 'coffee'];

    let out = `╔══════════════════════════════════════════╗\n`;
    out += `║   STRICT DELTA REPORT: POST-GOOGLE       ║\n`;
    out += `║   Generated: ${new Date().toISOString().slice(0, 19)}       ║\n`;
    out += `╚══════════════════════════════════════════╝\n\n`;

    out += `── HEADLINE METRICS ──\n`;
    out += `% listings with ≥1 real image:  ${percOne}%  (Δ ${deltaOne.startsWith('-') ? '' : '+'}${deltaOne}pp from baseline ${BASELINE.percOne}%)\n`;
    out += `% listings with ≥2 real images: ${percTwo}%  (Δ ${deltaTwo.startsWith('-') ? '' : '+'}${deltaTwo}pp from baseline ${BASELINE.percTwo}%)\n`;
    out += `Average visualScore:            ${avgVS}\n\n`;

    out += `── MATURITY BANDS ──\n`;
    out += `  Zero Images:   ${maturityBands.zero}  (was ${BASELINE.zeroBand}, Δ ${maturityBands.zero - BASELINE.zeroBand})\n`;
    out += `  Hero Only:     ${maturityBands.hero}  (was ${BASELINE.heroBand}, Δ +${maturityBands.hero - BASELINE.heroBand})\n`;
    out += `  2-3 Images:    ${maturityBands.twoToThree}  (was ${BASELINE.twoThreeBand}, Δ +${maturityBands.twoToThree - BASELINE.twoThreeBand})\n`;
    out += `  Threshold Met: ${maturityBands.thresholdMet}  (was ${BASELINE.thresholdBand}, Δ +${maturityBands.thresholdMet - BASELINE.thresholdBand})\n`;
    out += `  Rich Gallery:  ${maturityBands.gallery}  (was ${BASELINE.galleryBand}, Δ +${maturityBands.gallery - BASELINE.galleryBand})\n\n`;

    out += `── GOOGLE PLACES MATCH RESULTS ──\n`;
    out += `  Auto-attached (APPROVED): ${googleAutoAttached}\n`;
    out += `  Queued for review (PENDING): ${googleQueuedForReview}\n`;
    out += `  Rejected (FAILED): ${googleRejected}\n\n`;

    out += `── CATEGORY UPLIFT (Target Categories) ──\n`;
    targetCategories.forEach(cat => {
        const now = categoryMaturity[cat];
        const was = BASELINE.categories[cat];
        if (now) {
            const zDelta = was ? now.zero - was.zero : 0;
            const hDelta = was ? (now.hero || 0) - (was.hero || 0) : 0;
            out += `  ${cat.toUpperCase().padEnd(12)} (${now.total} places): Zero=${now.zero} (Δ${zDelta}), Hero=${now.hero || 0} (Δ+${hDelta}), Threshold=${now.thresholdMet || 0}\n`;
        }
    });

    out += `\n── ALL CATEGORIES ──\n`;
    Object.keys(categoryMaturity).sort((a, b) => categoryMaturity[b].total - categoryMaturity[a].total).forEach(c => {
        out += `  ${c.toUpperCase().padEnd(14)} (${categoryMaturity[c].total}): Zero=${categoryMaturity[c].zero}, Hero=${categoryMaturity[c].hero || 0}, 2-3=${categoryMaturity[c].twoToThree || 0}, Threshold=${categoryMaturity[c].thresholdMet || 0}\n`;
    });

    out += `\n── REMAINING ZERO-IMAGE COUNT ──\n`;
    out += `  ${maturityBands.zero} listings still at zero real images\n`;

    fs.writeFileSync('tmp/delta_report.txt', out);
    console.log(out);

    await prisma.$disconnect();
    pool.end();
}

deltaReport().catch(console.error);
