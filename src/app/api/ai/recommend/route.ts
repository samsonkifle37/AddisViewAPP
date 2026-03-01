import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { budget, nights, interests, city } = body;

        // Build a simple recommendation based on tags and city
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = { isActive: true };

        if (city) {
            where.city = { contains: city, mode: "insensitive" };
        }

        // Get all matching places
        const places = await prisma.place.findMany({
            where,
            include: {
                images: { take: 1, orderBy: { priority: "asc" } },
            },
        });

        // Simple scoring algorithm based on tag matches
        const interestTags = (interests || []).map((i: string) => i.toLowerCase());

        const scored = places.map((place) => {
            let score = 0;

            // Tag matching
            for (const tag of place.tags) {
                if (interestTags.includes(tag.toLowerCase())) score += 3;
            }

            // Type matching based on interests
            if (interestTags.includes("food") && place.type === "restaurant")
                score += 2;
            if (interestTags.includes("nightlife") && place.type === "club")
                score += 2;
            if (interestTags.includes("nature") && place.type === "tour") score += 2;
            if (interestTags.includes("history") && place.type === "tour") score += 2;
            if (interestTags.includes("culture") && place.type === "restaurant")
                score += 1;

            // Slight boost for stays if nights > 0
            if (
                nights &&
                nights > 0 &&
                ["hotel", "guesthouse", "apartment", "resort"].includes(place.type)
            ) {
                score += 1;
            }

            return { ...place, score };
        });

        // Sort by score descending, take top results
        scored.sort((a, b) => b.score - a.score);
        const recommended = scored.slice(0, 6);

        // Generate explanation
        const explanation = generateExplanation(
            recommended,
            budget,
            nights,
            interests,
            city
        );

        return NextResponse.json({
            recommendations: recommended.map((r) => ({
                id: r.id,
                name: r.name,
                slug: r.slug,
                type: r.type,
                city: r.city,
                area: r.area,
                shortDescription: r.shortDescription,
                heroImage: r.images[0]?.imageUrl || null,
                score: r.score,
            })),
            explanation,
        });
    } catch (error) {
        console.error("AI recommendation error:", error);
        return NextResponse.json(
            { error: "Failed to generate recommendations" },
            { status: 500 }
        );
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateExplanation(
    places: { name: string; type: string }[],
    budget: string | undefined,
    nights: number | undefined,
    interests: string[] | undefined,
    city: string | undefined
): string {
    const parts: string[] = [];

    if (city) parts.push(`in ${city}`);
    if (nights) parts.push(`for ${nights} night${nights > 1 ? "s" : ""}`);
    if (budget) parts.push(`on a ${budget} budget`);
    if (interests && interests.length > 0)
        parts.push(`interested in ${interests.join(", ")}`);

    const context = parts.length
        ? `Based on your trip ${parts.join(", ")}, `
        : "";

    const stayRecs = places
        .filter((p) =>
            ["hotel", "guesthouse", "apartment", "resort"].includes(p.type)
        )
        .map((p) => p.name);
    const activityRecs = places
        .filter(
            (p) =>
                !["hotel", "guesthouse", "apartment", "resort"].includes(p.type)
        )
        .map((p) => p.name);

    let explanation = context + "here are my top picks for you:\n\n";

    if (stayRecs.length > 0) {
        explanation += `🏨 **Stay at**: ${stayRecs.join(", ")}\n`;
    }
    if (activityRecs.length > 0) {
        explanation += `🎯 **Experience**: ${activityRecs.join(", ")}\n`;
    }

    explanation +=
        "\nEnjoy your Ethiopian adventure! 🇪🇹";

    return explanation;
}
