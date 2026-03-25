"use client";

import { CreditCard, Smartphone, ShieldCheck, Wallet, ArrowRight } from "lucide-react";
import { useInAppBrowser } from "./InAppBrowser";

export function TelebirrGuide() {
    const browser = useInAppBrowser();

    return (
        <div className="bg-white p-7 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 mt-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00A1E0]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden border border-gray-100">
                     {/* Placeholder for telebirr logo */}
                     <Wallet className="w-6 h-6 text-[#00A1E0]" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-[#1A1612] tracking-tight">Digital Payments</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#00A1E0] bg-[#00A1E0]/10 px-2.5 py-1 rounded-md">Telebirr</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-[10px] font-bold text-gray-500">Tourist Guide</span>
                    </div>
                </div>
            </div>

            <p className="text-sm text-gray-600 font-medium leading-relaxed mb-6 relative z-10">
                Ethiopia is rapidly moving towards a cashless society. As a tourist, getting set up with Telebirr (the national mobile money service) makes paying for taxis, coffee, and local shopping far easier.
            </p>

            <div className="space-y-4 relative z-10">
                <div className="grid gap-3">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex gap-3 items-start hover:border-[#D4AF37]/50 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                            <span className="font-black text-sm">1</span>
                        </div>
                        <div>
                            <h4 className="font-black text-sm text-gray-900 mb-1">Get a Tourist SIM</h4>
                            <p className="text-xs text-gray-500 font-medium">Head to the EthioTelecom kiosk inside the Bole Airport arrivals terminal. Bring your passport. It takes 5 minutes and costs ~100 ETB.</p>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex gap-3 items-start hover:border-[#D4AF37]/50 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <span className="font-black text-sm">2</span>
                        </div>
                        <div>
                            <h4 className="font-black text-sm text-gray-900 mb-1">Install Telebirr App</h4>
                            <p className="text-xs text-gray-500 font-medium">Download the app using airport Wi-Fi. Register using your new Ethiopian phone number.</p>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex gap-3 items-start hover:border-[#D4AF37]/50 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                            <span className="font-black text-sm">3</span>
                        </div>
                        <div>
                            <h4 className="font-black text-sm text-gray-900 mb-1">Load Cash</h4>
                            <p className="text-xs text-gray-500 font-medium">Hand cash (ETB) to any local agent, hotel reception, or bank and ask to deposit it into your Telebirr wallet.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 relative z-10">
                <button 
                    onClick={() => browser.open("https://telebirr.et", "Telebirr")}
                    className="w-full bg-[#1A1A2E] text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition shadow-xl"
                >
                    <Smartphone className="w-4 h-4" /> Download Telebirr App
                </button>
            </div>
            
            <div className="mt-5 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-3">
                 <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                 <p className="text-[11px] text-blue-900 font-medium leading-relaxed">
                     <strong className="font-black">Why you need this:</strong> To pay for a taxi via Ride or Feres, or to buy a coffee at Kaldi's, scanning a QR code with Telebirr is faster and avoids the hassle of not having exact change.
                 </p>
            </div>
        </div>
    );
}
