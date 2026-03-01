import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "addis_fallback_secret";

function getAdminUser(request: NextRequest): { userId: string } | null {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        return decoded;
    } catch {
        return null;
    }
}

// GET /api/admin/host-listings?status=pending
export async function GET(request: NextRequest) {
    const admin = getAdminUser(request);
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check user has admin role
    const user = await prisma.user.findUnique({ where: { id: admin.userId } });
    if (!user || !user.roles.includes("admin")) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status")?.toUpperCase() || "PENDING";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (status !== "ALL") {
        where.status = status;
    }

    const listings = await prisma.hostListing.findMany({
        where,
        include: {
            images: { take: 1 },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ listings });
}
