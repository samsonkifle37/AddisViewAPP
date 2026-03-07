const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const https = require('https');

const agent = new https.Agent({
    rejectUnauthorized: false
});

async function mirrorImage(imageUrl, folder, filename) {
    try {
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            httpsAgent: agent,
            headers: {
                'User-Agent': 'AddisViewImageValidator/1.0 (contact: admin@addisview.app)',
                'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
                'Referer': 'https://addisview.vercel.app'
            },
            timeout: 30000
        });

        const contentType = response.headers['content-type'] || 'image/jpeg';
        const buffer = Buffer.from(response.data);

        const path = `${folder}/${filename}.${contentType.split('/')[1] || 'jpg'}`;
        const { data, error } = await supabase.storage
            .from('public-images')
            .upload(path, buffer, {
                contentType,
                upsert: true
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('public-images')
            .getPublicUrl(path);

        return publicUrl;
    } catch (e) {
        console.error(`Mirroring error for ${imageUrl}:`, e.message);
        throw e;
    }
}

async function main() {
    console.log("Starting DIRECT bulk process (with PG Adapter)...");

    const batchFile = "tmp/sourced_images_final.json";
    const filePath = path.join(process.cwd(), batchFile);

    if (!fs.existsSync(filePath)) {
        console.error("Batch file not found:", filePath);
        process.exit(1);
    }

    const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`Processing ${items.length} items...`);

    for (const item of items) {
        try {
            console.log(`- ${item.name}`);
            const audit = await prisma.imageAudit.findUnique({ where: { id: item.id } });
            if (!audit) {
                console.warn(`  Audit not found for ${item.id}`);
                continue;
            }

            // Force update everything for the final run

            const place = await prisma.place.findUnique({ where: { id: audit.entityId } });
            if (!place) {
                console.warn(`  Place not found for ${audit.entityId}`);
                continue;
            }

            const typeFolder = (audit.entityType === 'tour') ? 'tours' :
                (audit.entityType === 'stay') ? 'stays' : 'places';
            const folder = `${typeFolder}/${place.slug}`;

            const finalUrl = await mirrorImage(item.imageUrl, folder, "cover");
            console.log(`  Mirrored: ${finalUrl}`);

            const imageMetadata = {
                imageUrl: finalUrl,
                imageSource: item.source || (item.imageUrl.includes('wikimedia') ? 'wikimedia' : 'official'),
                sourcePageUrl: item.sourcePageUrl || item.imageUrl,
                verifiedAt: new Date()
            };

            const existingImage = await prisma.placeImage.findFirst({
                where: { placeId: audit.entityId }
            });

            if (existingImage) {
                await prisma.placeImage.update({
                    where: { id: existingImage.id },
                    data: imageMetadata
                });
            } else {
                await prisma.placeImage.create({
                    data: {
                        placeId: audit.entityId,
                        priority: 0,
                        ...imageMetadata
                    }
                });
            }

            await prisma.imageAudit.update({
                where: { id: item.id },
                data: {
                    imageUrl: finalUrl,
                    status: 'ok',
                    httpCode: 200,
                    notes: "Mirrored via Direct Script",
                    checkedAt: new Date(),
                    verifiedAt: new Date(),
                    source: imageMetadata.imageSource,
                    sourcePageUrl: imageMetadata.sourcePageUrl
                }
            });

            console.log(`  Success!`);
        } catch (error) {
            console.error(`  Failed ${item.name}:`, error.message);
        }
    }

    console.log("DIRECT bulk process finished.");
}

main().catch(console.error).finally(() => {
    prisma.$disconnect();
    pool.end();
});
