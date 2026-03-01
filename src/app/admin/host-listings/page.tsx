"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
    Shield,
    CheckCircle,
    XCircle,
    Eye,
    ArrowLeft,
    Loader2,
    MapPin,
    Users,
    BedDouble,
    Bath,
    DollarSign,
    Mail,
    Phone,
    User,
    X,
    Clock,
    Home,
} from "lucide-react";

interface HostImage {
    id: string;
    imageUrl: string;
    altText: string | null;
}

interface HostListing {
    id: string;
    status: string;
    placeType: string;
    title: string;
    description: string;
    city: string;
    area: string;
    maxGuests: number;
    bedrooms: number;
    beds: number;
    bathrooms: number;
    pricePerNight: number;
    amenities: string[];
    hostName: string;
    hostEmail: string;
    hostPhone: string;
    rejectionReason: string | null;
    createdAt: string;
    images: HostImage[];
}

const statusColors: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-600 border-amber-200",
    APPROVED: "bg-green-50 text-ethiopia-green border-green-200",
    REJECTED: "bg-red-50 text-red-500 border-red-200",
};

const placeTypeLabels: Record<string, string> = {
    APARTMENT: "Apartment",
    GUESTHOUSE: "Guest House",
    ENTIRE_HOME: "Entire Home",
    PRIVATE_ROOM: "Private Room",
    SHARED_ROOM: "Shared Room",
};

export default function AdminHostListingsPage() {
    const { user, loading: authLoading } = useAuth();
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState("PENDING");
    const [selectedListing, setSelectedListing] = useState<HostListing | null>(null);
    const [rejectModalId, setRejectModalId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["admin-host-listings", statusFilter],
        queryFn: async () => {
            const res = await fetch(`/api/admin/host-listings?status=${statusFilter}`);
            if (res.status === 401 || res.status === 403) throw new Error("Unauthorized");
            if (!res.ok) throw new Error("Failed to fetch");
            return res.json();
        },
        enabled: !!user,
    });

    const fetchDetail = async (id: string) => {
        const res = await fetch(`/api/admin/host-listings/${id}`);
        if (!res.ok) throw new Error("Failed");
        const d = await res.json();
        setSelectedListing(d.listing);
    };

    const approveMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/admin/host-listings/${id}/approve`, {
                method: "POST",
            });
            if (!res.ok) throw new Error("Approval failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-host-listings"] });
            setSelectedListing(null);
        },
    });

    const rejectMutation = useMutation({
        mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
            const res = await fetch(`/api/admin/host-listings/${id}/reject`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason }),
            });
            if (!res.ok) throw new Error("Rejection failed");
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-host-listings"] });
            setRejectModalId(null);
            setRejectReason("");
            setSelectedListing(null);
        },
    });

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <Shield className="w-16 h-16 text-gray-200" />
                <h2 className="text-xl font-black text-gray-900">Admin Only</h2>
                <p className="text-sm text-gray-500 font-medium">
                    Sign in with an admin account to access this page.
                </p>
            </div>
        );
    }

    // ── Detail View ──
    if (selectedListing) {
        const listing = selectedListing;
        return (
            <div className="space-y-6 pt-4 pb-10">
                <button
                    onClick={() => setSelectedListing(null)}
                    className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-gray-600"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to list
                </button>

                {/* Header */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span
                            className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${statusColors[listing.status]}`}
                        >
                            {listing.status}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                            {placeTypeLabels[listing.placeType]}
                        </span>
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                        {listing.title}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                        <MapPin className="w-4 h-4" />
                        {listing.area ? `${listing.area}, ${listing.city}` : listing.city}
                    </div>
                </div>

                {/* Images */}
                {listing.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                        {listing.images.map((img) => (
                            <div
                                key={img.id}
                                className="aspect-square rounded-2xl overflow-hidden bg-gray-100"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={img.imageUrl}
                                    alt={img.altText || listing.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Description */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 mb-3">
                        Description
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
                        {listing.description}
                    </p>
                </div>

                {/* Property Details */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { icon: Users, label: "Max Guests", value: listing.maxGuests },
                        { icon: Home, label: "Bedrooms", value: listing.bedrooms },
                        { icon: BedDouble, label: "Beds", value: listing.beds },
                        { icon: Bath, label: "Bathrooms", value: listing.bathrooms },
                    ].map(({ icon: Icon, label, value }) => (
                        <div
                            key={label}
                            className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3"
                        >
                            <Icon className="w-4 h-4 text-gray-400" />
                            <div>
                                <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block">
                                    {label}
                                </span>
                                <span className="text-lg font-black text-gray-900">{value}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Price */}
                <div className="bg-ethiopia-green/5 p-5 rounded-2xl border border-ethiopia-green/10 flex items-center gap-4">
                    <DollarSign className="w-6 h-6 text-ethiopia-green" />
                    <div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block">
                            Price Per Night
                        </span>
                        <span className="text-2xl font-black text-gray-900">
                            ${listing.pricePerNight}
                        </span>
                    </div>
                </div>

                {/* Amenities */}
                {listing.amenities.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                            Amenities
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {listing.amenities.map((a) => (
                                <span
                                    key={a}
                                    className="bg-gray-50 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-100"
                                >
                                    {a}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Host Info */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                    <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">
                        Host Information
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{listing.hostName}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{listing.hostEmail}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{listing.hostPhone}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">
                                Submitted {new Date(listing.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Rejection reason */}
                {listing.rejectionReason && (
                    <div className="bg-red-50 p-5 rounded-2xl border border-red-100">
                        <p className="text-sm text-red-600 font-bold">
                            Rejected: {listing.rejectionReason}
                        </p>
                    </div>
                )}

                {/* Actions */}
                {listing.status === "PENDING" && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => approveMutation.mutate(listing.id)}
                            disabled={approveMutation.isPending}
                            className="flex-1 bg-ethiopia-green text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-ethiopia-green/30 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {approveMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <CheckCircle className="w-4 h-4" />
                            )}{" "}
                            Approve
                        </button>
                        <button
                            onClick={() => setRejectModalId(listing.id)}
                            className="flex-1 bg-red-50 text-red-500 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border border-red-200 flex items-center justify-center gap-2"
                        >
                            <XCircle className="w-4 h-4" /> Reject
                        </button>
                    </div>
                )}
            </div>
        );
    }

    const listings: HostListing[] = data?.listings || [];

    // ── List View ──
    return (
        <div className="space-y-6 pt-4 pb-10">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-ethiopia-green" />
                    <h1 className="text-2xl font-black tracking-tight">
                        Host Listings
                    </h1>
                </div>
                <p className="text-brand-muted text-sm font-medium italic">
                    Review and manage host submissions
                </p>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {["PENDING", "APPROVED", "REJECTED", "ALL"].map((s) => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${statusFilter === s
                            ? "bg-gray-900 text-white border-gray-800 shadow-lg"
                            : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                            }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Listings */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="bg-gray-100 animate-pulse h-28 rounded-2xl"
                        />
                    ))}
                </div>
            ) : listings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <div className="text-4xl mb-3">📋</div>
                    <h3 className="text-sm font-bold text-gray-900">
                        No {statusFilter.toLowerCase()} listings
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">
                        {statusFilter === "PENDING"
                            ? "All caught up! No listings waiting for review."
                            : "No listings with this status yet."}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {listings.map((listing: HostListing) => (
                        <button
                            key={listing.id}
                            onClick={() => fetchDetail(listing.id)}
                            className="w-full bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-left flex gap-4"
                        >
                            {/* Thumbnail */}
                            <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                {listing.images[0] ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={listing.images[0].imageUrl}
                                        alt={listing.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl">
                                        🏠
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold text-gray-900 truncate">
                                        {listing.title}
                                    </h3>
                                    <span
                                        className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border flex-shrink-0 ${statusColors[listing.status]}`}
                                    >
                                        {listing.status}
                                    </span>
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold">
                                    {placeTypeLabels[listing.placeType]} · {listing.city} ·{" "}
                                    ${listing.pricePerNight}/night
                                </p>
                                <p className="text-[10px] text-gray-400 font-medium">
                                    Host: {listing.hostName}
                                </p>
                            </div>
                            <Eye className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                        </button>
                    ))}
                </div>
            )}

            {/* Reject Modal */}
            {rejectModalId && (
                <div
                    className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
                    onClick={() => setRejectModalId(null)}
                >
                    <div
                        className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl space-y-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black text-gray-900">
                                Reject Listing
                            </h2>
                            <button
                                onClick={() => setRejectModalId(null)}
                                className="p-2 bg-gray-100 rounded-xl"
                            >
                                <X className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                        <textarea
                            placeholder="Reason for rejection (optional)..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={3}
                            className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 text-sm font-medium resize-none focus:ring-2 focus:ring-red-100 outline-none"
                        />
                        <button
                            onClick={() =>
                                rejectMutation.mutate({
                                    id: rejectModalId,
                                    reason: rejectReason,
                                })
                            }
                            disabled={rejectMutation.isPending}
                            className="w-full bg-red-500 text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {rejectMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <XCircle className="w-4 h-4" />
                            )}
                            Confirm Rejection
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
