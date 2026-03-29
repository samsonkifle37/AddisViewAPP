import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
    console.log("Adding Productization hooks to top listings...");

    // Make 10 random hotels/restaurants with > 0 real images "featured"
    const topListings = await prisma.placeImage.findMany({
        where: { imageTruthType: "place_real", priority: 0 },
        select: { placeId: true },
        take: 10
    });
    
    for (const l of topListings) {
        await prisma.place.update({
            where: { id: l.placeId },
            data: { featured: true, verificationScore: 80, ownerVerified: Math.random() > 0.5 }
        });
    }

    console.log("Done.");
    pool.end();
}
run();
