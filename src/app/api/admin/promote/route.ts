import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/admin/promote — make a user admin (protected by seed secret)
export async function POST(request: NextRequest) {
    try {
        const { secret, email } = await request.json();

        if (secret !== process.env.ADMIN_SEED_SECRET) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.update({
            where: { email },
            data: { roles: ["traveller", "admin"] },
        });

        return NextResponse.json({
            message: `${user.name} (${user.email}) is now an admin`,
            roles: user.roles,
        });
    } catch (error) {
        console.error("Promote error:", error);
        return NextResponse.json({ error: "Failed to promote user" }, { status: 500 });
    }
}
