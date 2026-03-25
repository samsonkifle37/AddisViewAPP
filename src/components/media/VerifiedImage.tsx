"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle, Image as ImageIcon } from "lucide-react";

interface VerifiedImageProps {
    src?: string | null;
    alt: string;
    className?: string;
    entityType?: "place" | "stay" | "tour" | "dining" | "nightlife" | "operator" | "transport" | string;
    status?: "ok" | "missing" | "blocked" | "broken" | "APPROVED" | "PENDING" | "FAILED" | null;
    showBadge?: boolean;
    badgeText?: string;
    fallbackSrc?: string;
    priority?: boolean;
    isRepresentative?: boolean;
}

export function VerifiedImage({
    src,
    alt,
    className = "",
    entityType = "place",
    status,
    showBadge = true,
    badgeText = "Real Photo",
    fallbackSrc = "",
    priority = false,
    isRepresentative = false,
}: VerifiedImageProps) {
    const [imgError, setImgError] = useState(false);

    const hashString = (str: string) => {
        let hash = 0;
        if (!str) return 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    };

    const getCuratedFallback = (type: string, seed: string) => {
        const t = (type || "").toLowerCase();
        let category = "general";
        if (t.includes("hotel") || t.includes("stay") || t.includes("apartment") || t.includes("guesthouse") || t.includes("resort") || t.includes("lodge")) category = "stay";
        else if (t.includes("restaurant") || t.includes("dining") || t.includes("coffee") || t.includes("nightlife") || t.includes("club") || t.includes("cafe")) category = "dining";
        else if (t.includes("museum") || t.includes("culture") || t.includes("history") || t.includes("park") || t.includes("nature") || t.includes("tour") || t.includes("guide") || t.includes("attraction")) category = "tour";
        
        const THEME_IMAGES: Record<string, string[]> = {
            stay: [
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1542314831-c6a4d27ce66b?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1551882547-ff40c0d509af?auto=format&fit=crop&w=800&q=80"
            ],
            dining: [
                "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1414235077428-338988a2e8c0?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80"
            ],
            tour: [
                "https://images.unsplash.com/photo-1527824404775-dce343118ebc?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1547471080-7fc2caa6a54c?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1518182170546-076616fdceae?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80"
            ],
            general: [
                "https://images.unsplash.com/photo-1627997972836-39ce3e309320?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1583162082987-0b1aeb8fd332?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1502598382346-6014e7a685c4?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
                "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80"
            ]
        };
        const arr = THEME_IMAGES[category];
        const index = hashString(seed) % arr.length;
        return arr[index];
    };

    let safeSrc = src;
    if (safeSrc && safeSrc.includes('/fallbacks/hotel.png')) {
        safeSrc = '/fallbacks/stay-placeholder.svg';
    }

    const isDbFallback = safeSrc?.includes('/fallbacks/') || false;
    // Modified to consider unsplash.com as a valid fallback, not skip it
    const hasValidSrc = safeSrc && safeSrc.trim() !== "" && !isDbFallback;
    const shouldShowFallback = imgError || !hasValidSrc || isDbFallback;
    const isExplicitRepresentative = isRepresentative || shouldShowFallback;
    
    const resolvedFallback = isDbFallback ? (safeSrc as string) : (fallbackSrc || getCuratedFallback(entityType, alt));

    const finalSrc = shouldShowFallback
        ? resolvedFallback
        : (safeSrc?.includes("supabase.co") || safeSrc?.startsWith("/") || safeSrc?.includes("wikimedia.org") || safeSrc?.includes("googleusercontent.com") || safeSrc?.includes("unsplash.com")
            ? safeSrc as string
            : `/api/image-proxy?url=${encodeURIComponent(safeSrc as string)}`);

    const isVerified = !isExplicitRepresentative && (finalSrc.includes("supabase.co") || finalSrc.includes("wikimedia.org") || finalSrc.includes("googleusercontent.com") || status === "ok" || status === "APPROVED");

    return (
        <div className={`relative overflow-hidden bg-[#1A1612] ${className}`}>
            <Image
                src={finalSrc}
                alt={alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-all duration-700"
                onError={() => {
                    if (!imgError && finalSrc !== resolvedFallback) setImgError(true);
                }}
                priority={priority}
                loading={priority ? undefined : "lazy"}
                decoding="async"
                unoptimized={finalSrc?.includes('wikimedia.org') || finalSrc?.includes('/api/image-proxy') || finalSrc?.includes('googleusercontent.com') || finalSrc?.includes('/fallbacks/') || finalSrc?.includes('unsplash.com')}
            />

            {/* Badge */}
            {showBadge && isVerified && (
                <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
                    <span className="bg-black/60 backdrop-blur-md text-white/90 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded shadow text-shadow-sm border border-white/10 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        {badgeText}
                    </span>
                </div>
            )}
        </div>
    );
}
