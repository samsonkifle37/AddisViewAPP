import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const { secret, places } = await request.json();

        // Protect with env secret
        if (secret !== process.env.ADMIN_SEED_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!Array.isArray(places) || places.length === 0) {
            return NextResponse.json(
                { error: "places array is required" },
                { status: 400 }
            );
        }

        const results = [];

        for (const placeData of places) {
            const {
                name,
                type,
                city,
                area,
                country,
                websiteUrl,
                bookingUrl,
                tags,
                source,
                shortDescription,
                longDescription,
                phone,
                email,
                latitude,
                longitude,
                images, // array of { imageUrl, altText?, priority?, sourcePageUrl? }
            } = placeData;

            // Generate slug from name
            const slug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");

            // Upsert: create or update based on slug
            const place = await prisma.place.upsert({
                where: { slug },
                update: {
                    name,
                    type,
                    city,
                    area: area || "",
                    country: country || "Ethiopia",
                    websiteUrl,
                    bookingUrl,
                    tags: tags || [],
                    source: source || "manual-seed",
                    shortDescription,
                    longDescription,
                    phone,
                    email,
                    latitude,
                    longitude,
                },
                create: {
                    name,
                    slug,
                    type,
                    city,
                    area: area || "",
                    country: country || "Ethiopia",
                    websiteUrl,
                    bookingUrl,
                    tags: tags || [],
                    source: source || "manual-seed",
                    shortDescription,
                    longDescription,
                    phone,
                    email,
                    latitude,
                    longitude,
                },
            });

            // Handle images if provided
            if (images && Array.isArray(images) && images.length > 0) {
                // Delete existing images for this place, then re-create
                await prisma.placeImage.deleteMany({
                    where: { placeId: place.id },
                });

                await prisma.placeImage.createMany({
                    data: images.map(
                        (
                            img: {
                                imageUrl: string;
                                altText?: string;
                                priority?: number;
                                sourcePageUrl?: string;
                            },
                            index: number
                        ) => ({
                            placeId: place.id,
                            imageUrl: img.imageUrl,
                            altText: img.altText || name,
                            priority: img.priority ?? index,
                            sourcePageUrl: img.sourcePageUrl,
                        })
                    ),
                });
            }

            results.push({ slug: place.slug, name: place.name, id: place.id });
        }

        return NextResponse.json({
            message: `Seeded ${results.length} places`,
            results,
        });
    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json(
            { error: "Failed to seed places" },
            { status: 500 }
        );
    }
}
