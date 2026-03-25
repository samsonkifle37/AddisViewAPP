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
            if (interestTags.includes("food") && place.type === "restaurant") score += 2;
            if (interestTags.includes("nightlife") && place.type === "club") score += 2;
            if (interestTags.includes("nature") && place.type === "park") score += 2;
            if (interestTags.includes("history") && place.type === "museum") score += 2;
            if (interestTags.includes("culture") && ["restaurant", "tour", "museum", "religious site", "landmark"].includes(place.type)) score += 1;

            return { ...place, score };
        });

        scored.sort((a, b) => b.score - a.score);

        // ITINERARY BALANCE RULE
        // Morning -> cultural site (museum, religious site, landmark)
        // Afternoon -> market or tour (market, park, tour, attraction)
        // Evening -> restaurant or nightlife (restaurant, cafe, club, nightlife)
        
        const morningTypes = ["museum", "religious site", "landmark"];
        const afternoonTypes = ["market", "park", "tour", "attraction", "cafe"];
        const eveningTypes = ["restaurant", "club", "nightlife"];
        
        const mornings = scored.filter(p => morningTypes.includes(p.type));
        const afternoons = scored.filter(p => afternoonTypes.includes(p.type));
        const evenings = scored.filter(p => eveningTypes.includes(p.type));

        // Let's create an interleaved itinerary up to the requested days
        const requestedDays = nights || 3;
        const daysArray: any[] = [];
        const usedIds = new Set();
        let cardsGenerated = 0;
        
        for (let day = 1; day <= requestedDays; day++) {
            // Pick Morning
            let m = mornings.find(x => !usedIds.has(x.id));
            if (!m) { usedIds.clear(); m = mornings.find(x => !usedIds.has(x.id)) || scored[0]; }
            if (m) { usedIds.add(m.id); cardsGenerated++; }

            // Pick Afternoon
            let a = afternoons.find(x => !usedIds.has(x.id));
            if (!a) { usedIds.clear(); a = afternoons.find(x => !usedIds.has(x.id)) || scored[1]; }
            if (a) { usedIds.add(a.id); cardsGenerated++; }

            // Pick Evening
            let e = evenings.find(x => !usedIds.has(x.id));
            if (!e) { usedIds.clear(); e = evenings.find(x => !usedIds.has(x.id)) || scored[2]; }
            if (e) { usedIds.add(e.id); cardsGenerated++; }

            daysArray.push({
                day,
                morning: m,
                afternoon: a,
                evening: e
            });
        }

        const debug = {
            requestedDays,
            generatedDays: daysArray.length,
            numberOfRenderedDays: daysArray.length, // Checked on client side mostly
            totalCards: cardsGenerated
        };
        console.log("PLANNER DEBUG SUMMARY:", debug);

        const recommendedFlat = daysArray.flatMap(d => [d.morning, d.afternoon, d.evening]).filter(Boolean);
        // Generate explanation
        const explanation = generateExplanation(
            recommendedFlat,
            budget,
            nights,
            interests,
            city
        );

        const formatPlace = (r: any) => r ? ({
            id: r.id,
            name: r.name,
            slug: r.slug,
            type: r.type,
            city: r.city,
            area: r.area,
            shortDescription: r.shortDescription,
            heroImage: r.images?.[0]?.imageUrl || null,
            score: r.score,
        }) : null;

        return NextResponse.json({
            days: daysArray.map(d => ({
                day: d.day,
                morning: formatPlace(d.morning),
                afternoon: formatPlace(d.afternoon),
                evening: formatPlace(d.evening)
            })),
            debug,
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
