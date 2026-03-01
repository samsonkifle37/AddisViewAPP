import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/host-listings — Public: Submit a new host listing
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            placeType,
            title,
            description,
            city,
            area,
            country = "Ethiopia",
            maxGuests,
            bedrooms,
            beds,
            bathrooms,
            pricePerNight,
            amenities,
            hostName,
            hostEmail,
            hostPhone,
            imageUrls,
        } = body;

        // Validate required fields
        if (!placeType || !title || !description || !city || !hostName || !hostEmail || !hostPhone) {
            return NextResponse.json(
                { error: "Required fields: placeType, title, description, city, hostName, hostEmail, hostPhone" },
                { status: 400 }
            );
        }

        if (!maxGuests || !bedrooms || !beds || !bathrooms || !pricePerNight) {
            return NextResponse.json(
                { error: "Required fields: maxGuests, bedrooms, beds, bathrooms, pricePerNight" },
                { status: 400 }
            );
        }

        // Validate placeType enum
        const validTypes = ["APARTMENT", "GUESTHOUSE", "ENTIRE_HOME", "PRIVATE_ROOM", "SHARED_ROOM"];
        if (!validTypes.includes(placeType)) {
            return NextResponse.json(
                { error: `placeType must be one of: ${validTypes.join(", ")}` },
                { status: 400 }
            );
        }

        const hostListing = await prisma.hostListing.create({
            data: {
                placeType,
                title,
                description,
                city,
                area: area || "",
                country,
                maxGuests: Number(maxGuests),
                bedrooms: Number(bedrooms),
                beds: Number(beds),
                bathrooms: Number(bathrooms),
                pricePerNight: Number(pricePerNight),
                amenities: amenities || [],
                hostName,
                hostEmail,
                hostPhone,
                status: "PENDING",
                images: {
                    create: (imageUrls ?? []).map((url: string, index: number) => ({
                        imageUrl: url,
                        altText: `${title} photo ${index + 1}`,
                    })),
                },
            },
            include: { images: true },
        });

        return NextResponse.json(
            { message: "Listing submitted successfully! We'll review it shortly.", id: hostListing.id },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating host listing:", error);
        const msg = error instanceof Error ? error.message : String(error);
        return NextResponse.json(
            { error: "Failed to create host listing", detail: msg },
            { status: 500 }
        );
    }
}
