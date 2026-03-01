import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "addis_fallback_secret";

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("auth-token")?.value;

        if (!token) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: string;
            email: string;
        };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, name: true, email: true, bio: true, createdAt: true },
        });

        if (!user) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        return NextResponse.json({ user });
    } catch {
        return NextResponse.json({ user: null }, { status: 200 });
    }
}
