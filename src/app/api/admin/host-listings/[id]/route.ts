import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "addis_fallback_secret";

function getAdminUser(request: NextRequest): { userId: string } | null {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) return null;
    try {
        return jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
        return null;
    }
}

// GET /api/admin/host-listings/[id] — get full detail
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = getAdminUser(request);
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: admin.userId } });
    if (!user || !user.roles.includes("admin")) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;

    const listing = await prisma.hostListing.findUnique({
        where: { id },
        include: { images: true, linkedPlace: true },
    });

    if (!listing) {
        return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json({ listing });
}
