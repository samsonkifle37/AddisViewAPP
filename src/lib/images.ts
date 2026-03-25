export interface ImageItem {
    id?: string;
    imageUrl: string;
    mirroredUrl?: string | null;
    isMirrored?: boolean;
    status?: string;
    qualityScore?: number;
    priority?: number;
    altText?: string | null;
}

export interface ImageEntity {
    images?: ImageItem[];
    auditStatus?: "ok" | "missing" | "blocked" | "broken" | null;
}

/**
 * Returns the best image URL from the entity's images array.
 * Strictly enforces Phase 2 Validation + Mirroring hierarchy.
 */
export function getPrimaryVerifiedImage(entity: any, entityType?: string, entityId?: string): string | null {
    if (!entity || !entity.images || !Array.isArray(entity.images) || entity.images.length === 0) return null;

    // 1. Filter out known bad/failing images based on Pipeline
    const validImages = entity.images.filter((img: any) => img.status !== 'FAILED' && img.status !== 'REJECTED');
    if (validImages.length === 0) return null;

    // 2. Sort explicitly by TruthType (real > rep > placeholder), then Priority (0 is top), then LLM QualityScore
    const sorted = [...validImages].sort((a, b) => {
        const typeA = a.imageTruthType === 'place_real' ? 0 : (a.imageTruthType === 'representative' ? 1 : 2);
        const typeB = b.imageTruthType === 'place_real' ? 0 : (b.imageTruthType === 'representative' ? 1 : 2);
        if (typeA !== typeB) return typeA - typeB;
        if (a.priority !== b.priority) return (a.priority ?? 99) - (b.priority ?? 99);
        return (b.qualityScore || 0) - (a.qualityScore || 0);
    });

    // PASS 1: The gold standard. Officially approved AND natively mirrored to our own cloud.
    for (const img of sorted) {
        if (img.status === 'APPROVED' && img.isMirrored && img.mirroredUrl) {
            return img.mirroredUrl;
        }
    }

    // PASS 2: Approved by moderation but mirroring may have failed or was skipped. Rely on original source URL.
    for (const img of sorted) {
        if (img.status === 'APPROVED' && img.imageUrl) {
            return img.mirroredUrl || img.imageUrl;
        }
    }

    // PASS 3: Safe fallback loop for images freshly ingested that haven't passed background ETL bucket yet.
    for (const img of sorted) {
        if (img.status === 'PENDING' && img.imageUrl) {
            return img.mirroredUrl || img.imageUrl;
        }
    }

    // PASS 4: Legacy fallback for records not adhering to pipeline schemas
    for (const img of sorted) {
        if (img.imageUrl && img.imageUrl.trim() !== "") return img.imageUrl;
    }

    return null;
}
