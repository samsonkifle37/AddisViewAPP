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

// POST /api/admin/host-listings/[id]/reject
export async function POST(
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

    const listing = await prisma.hostListing.findUnique({ where: { id } });

    if (!listing) {
        return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.status !== "PENDING") {
        return NextResponse.json(
            { error: `Listing is already ${listing.status.toLowerCase()}` },
            { status: 400 }
        );
    }

    let reason: string | null = null;
    try {
        const body = await request.json();
        reason = body.reason || null;
    } catch {
        // No body is fine
    }

    const updated = await prisma.hostListing.update({
        where: { id },
        data: {
            status: "REJECTED",
            rejectionReason: reason,
        },
    });

    return NextResponse.json({
        message: "Listing rejected.",
        listing: updated,
    });
}
