import { CurrencyConverter } from "@/components/CurrencyConverter";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
    title: "Currency Converter — NU",
    description: "Live exchange rates for Ethiopian Birr (ETB).",
};

export default function CurrencyPage() {
    return (
        <div className="pt-8 space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <Link href="/" className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-900" />
                </Link>
                <h1 className="text-2xl font-black tracking-tight text-[#1A1612]">Exchange Money</h1>
            </div>
            
            <CurrencyConverter />
            
            <div className="bg-blue-50 text-blue-800 p-5 rounded-3xl text-xs font-medium space-y-3 leading-relaxed border border-blue-100/50">
                <p>
                    <span className="font-bold">Pro Tip:</span> While major hotels and supermarkets accept credit cards, you will need cash (Ethiopian Birr) for taxis, small shops, and tips.
                </p>
                <p>
                    ATMs are widely available in Addis Ababa, but it's recommended to carry some USD or EUR for emergency exchange at valid bank branches.
                </p>
            </div>
        </div>
    );
}
