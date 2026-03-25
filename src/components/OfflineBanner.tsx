"use client";

import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        function handleOnline() {
            setIsOffline(false);
        }
        function handleOffline() {
            setIsOffline(true);
        }

        if (typeof window !== "undefined") {
            setIsOffline(!navigator.onLine);
            window.addEventListener("online", handleOnline);
            window.addEventListener("offline", handleOffline);

            return () => {
                window.removeEventListener("online", handleOnline);
                window.removeEventListener("offline", handleOffline);
            };
        }
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-gray-900 text-white shadow-md text-center py-2 px-4 flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#D4AF37]">
                You're offline — viewing cached content
            </span>
        </div>
    );
}
