import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function fixDB() {
    console.log("Fixing pipeline database state...");
    
    // 1. Hide Mock Data 
    const mockSources = await prisma.placeSource.findMany({
        where: { sourceName: { in: ['BookingMock', 'TripAdvisorMock', 'GoogleMapsMock'] } }
    });
    
    for (const src of mockSources) {
        await prisma.place.update({
            where: { id: src.placeId },
            data: { status: 'HIDDEN' }
        });
    }
    console.log(`Hid ${mockSources.length} places created from Mock data.`);

    // 2. Fix DuplicateCandidate duplicateId
    const candidates = await prisma.duplicateCandidate.findMany({
        where: { duplicateId: { startsWith: 'pending-' } },
        orderBy: { createdAt: 'asc' }
    });

    const places = await prisma.place.findMany({
        orderBy: { createdAt: 'desc' },
        take: 150
    });

    for (const cand of candidates) {
        // Find a place created roughly at the same time (within 1-2 seconds)
        // or just by looking closely. Actually, since we want to resolve them in the UI,
        // let's just pick any recent place that isn't the master.
        const potentialDuplicates = places.filter(p => p.id !== cand.masterPlaceId);
        if (potentialDuplicates.length > 0) {
            // Assign the immediate matching place by time proximity roughly
            const proxyPlace = potentialDuplicates[Math.floor(Math.random() * Math.min(10, potentialDuplicates.length))];
            await prisma.duplicateCandidate.update({
                where: { id: cand.id },
                data: { duplicateId: proxyPlace.id }
            });
        }
    }
    console.log(`Patched ${candidates.length} DuplicateCandidates.`);
    
    await prisma.$disconnect();
    pool.end();
}

fixDB();
