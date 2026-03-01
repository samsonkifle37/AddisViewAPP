import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "addis_fallback_secret";

function getUserId(request: NextRequest): string | null {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        return decoded.userId;
    } catch {
        return null;
    }
}

// GET /api/user/favorites — list user's favorites
export async function GET(request: NextRequest) {
    const userId = getUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
        where: { userId },
        include: {
            place: {
                include: {
                    images: { take: 1, orderBy: { priority: "asc" } },
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ favorites });
}

// POST /api/user/favorites — add favorite
export async function POST(request: NextRequest) {
    const userId = getUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { placeId } = await request.json();
    if (!placeId) {
        return NextResponse.json(
            { error: "placeId is required" },
            { status: 400 }
        );
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
        where: { userId_placeId: { userId, placeId } },
    });

    if (existing) {
        return NextResponse.json({ favorite: existing, alreadyExists: true });
    }

    const favorite = await prisma.favorite.create({
        data: { userId, placeId },
    });

    return NextResponse.json({ favorite }, { status: 201 });
}

// DELETE /api/user/favorites — remove favorite
export async function DELETE(request: NextRequest) {
    const userId = getUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { placeId } = await request.json();
    if (!placeId) {
        return NextResponse.json(
            { error: "placeId is required" },
            { status: 400 }
        );
    }

    await prisma.favorite.deleteMany({
        where: { userId, placeId },
    });

    return NextResponse.json({ success: true });
}
