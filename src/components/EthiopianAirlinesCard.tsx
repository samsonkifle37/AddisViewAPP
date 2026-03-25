"use client";

import { Plane, ExternalLink, Activity } from "lucide-react";
import { useInAppBrowser } from "./InAppBrowser";

export function EthiopianAirlinesCard() {
    const browser = useInAppBrowser();

    return (
        <div className="bg-[#006A3A]/5 border border-[#006A3A]/20 p-6 rounded-[2rem] shadow-sm relative overflow-hidden mt-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FCDA05]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#006A3A] text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-[#006A3A]/30">
                    ET
                </div>
                <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none">Ethiopian Airlines</h3>
                    <p className="text-xs text-[#006A3A] font-bold mt-1 uppercase tracking-widest">The New Spirit of Africa</p>
                </div>
            </div>

            <p className="text-sm text-gray-600 font-medium leading-relaxed mb-5">
                Africa's largest airline. Manage your flights, check status, and get your connection info at Bole International Airport (ADD).
            </p>

            <div className="space-y-3">
                <button 
                    onClick={() => browser.open("https://www.ethiopianairlines.com/aa/book/booking/flight", "Ethiopian Airlines — Book Flight")}
                    className="w-full bg-[#006A3A] hover:bg-[#00512c] text-white p-4 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-colors shadow-md shadow-[#006A3A]/20"
                >
                    <Plane className="w-4 h-4" /> Book a flight
                </button>
                <button 
                    onClick={() => browser.open("https://www.ethiopianairlines.com/aa/book/booking/flight-status", "Ethiopian Airlines — Flight Status")}
                    className="w-full bg-white hover:bg-gray-50 text-[#006A3A] border border-[#006A3A]/20 p-4 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-colors shadow-sm"
                >
                    <Activity className="w-4 h-4" /> Flight Status
                </button>
                <button 
                    onClick={() => browser.open("https://www.ethiopianairlines.com/aa/explore/addis-ababa-airport", "Ethiopian Airlines — Bole Airport Guide")}
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 p-4 rounded-xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest transition-colors shadow-sm"
                >
                    <ExternalLink className="w-4 h-4" /> Bole Airport (ADD) Guide
                </button>
            </div>
            
            <div className="mt-5 pt-4 border-t border-[#006A3A]/10 text-[10px] text-gray-500 font-bold">
                * Ethiopian Airlines app highly recommended for digital boarding passes.
            </div>
        </div>
    );
}
