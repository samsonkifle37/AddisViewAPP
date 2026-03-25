"use client";

import { useState, useEffect } from "react";
import { ArrowRightLeft, RefreshCw, AlertCircle } from "lucide-react";

const CURRENCIES = ["USD", "EUR", "GBP", "AED", "CNY", "SAR", "CAD", "AUD"];

export function CurrencyConverter() {
    const [rates, setRates] = useState<Record<string, number>>({});
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [amount, setAmount] = useState<string>("1");
    const [fromCurrency, setFromCurrency] = useState("USD");
    const [toCurrency, setToCurrency] = useState("ETB");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRates = async () => {
        setLoading(true);
        setError(null);
        try {
            // Using a free API for exchange rates. Fallback to cached if offline.
            const res = await fetch("https://api.exchangerate.host/latest?base=USD");
            if (!res.ok) throw new Error("Failed to fetch rates");
            const data = await res.json();
            
            if (data && data.rates && data.rates.ETB) {
                setRates(data.rates);
                const timestamp = new Date().toLocaleString();
                setLastUpdated(timestamp);
                
                // Cache for offline
                if (typeof window !== "undefined") {
                    localStorage.setItem("fx_rates", JSON.stringify(data.rates));
                    localStorage.setItem("fx_updated", timestamp);
                }
            } else {
                throw new Error("Invalid format");
            }
        } catch (err: any) {
            console.error(err);
            if (typeof window !== "undefined") {
                const cached = localStorage.getItem("fx_rates");
                const cachedTime = localStorage.getItem("fx_updated");
                if (cached && cachedTime) {
                    setRates(JSON.parse(cached));
                    setLastUpdated(cachedTime + " (Offline)");
                } else {
                    // Fallback static rates for Ethiopia if everything fails
                    setRates({
                        ETB: 120, // Approx as of late 2024
                        USD: 1,
                        EUR: 0.92,
                        GBP: 0.79,
                        AED: 3.67,
                        CNY: 7.23,
                        SAR: 3.75,
                        CAD: 1.36,
                        AUD: 1.52,
                    });
                    setLastUpdated("Offline Fallback");
                    setError("Using estimated fallback rates.");
                }
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates();
    }, []);

    const handleSwap = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    // Calculate conversion
    let converted = "0.00";
    if (rates[fromCurrency] && rates[toCurrency]) {
        const amountNum = parseFloat(amount) || 0;
        // base is USD
        const baseAmount = amountNum / rates[fromCurrency];
        converted = (baseAmount * rates[toCurrency]).toFixed(2);
    }

    // Display rate "1 FROM = X TO"
    let rateDisplay = "";
    if (rates[fromCurrency] && rates[toCurrency]) {
        const oneUnitAmount = 1 / rates[fromCurrency] * rates[toCurrency];
        rateDisplay = `1 ${fromCurrency} = ${oneUnitAmount.toFixed(2)} ${toCurrency}`;
    }

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9973B]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-[#1A1612] tracking-tight">Currency <span className="text-[#C9973B]">Converter</span></h2>
                <button 
                    onClick={fetchRates} 
                    disabled={loading}
                    className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {error && (
                <div className="mb-4 bg-orange-50 text-orange-600 p-3 rounded-xl flex items-start gap-2 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{error}</p>
                </div>
            )}

            <div className="space-y-4 relative z-10">
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between transition-colors focus-within:border-[#C9973B]/30 focus-within:bg-white focus-within:shadow-sm">
                    <div className="flex-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Amount</label>
                        <input 
                            type="number" 
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-transparent text-2xl font-black text-[#1A1612] w-full focus:outline-none"
                            placeholder="0.00"
                        />
                    </div>
                    <select 
                        value={fromCurrency} 
                        onChange={(e) => setFromCurrency(e.target.value)}
                        className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-black text-gray-900 focus:outline-none"
                    >
                        <option value="ETB">ETB</option>
                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="relative flex justify-center -my-2 z-20">
                    <button 
                        onClick={handleSwap}
                        className="w-10 h-10 bg-[#1A1612] text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors shadow-lg active:scale-90"
                    >
                        <ArrowRightLeft className="w-4 h-4" />
                    </button>
                </div>

                <div className="bg-[#C9973B]/10 rounded-2xl p-4 border border-[#C9973B]/20 flex items-center justify-between">
                    <div className="flex-1 overflow-hidden pr-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#C9973B] block mb-1">Converted</label>
                        <div className="text-2xl font-black text-[#1A1612] truncate">{converted}</div>
                    </div>
                    <select 
                        value={toCurrency} 
                        onChange={(e) => setToCurrency(e.target.value)}
                        className="bg-white border border-[#C9973B]/30 rounded-xl px-3 py-2 text-sm font-black text-[#1A1612] focus:outline-none shadow-sm"
                    >
                        <option value="ETB">ETB</option>
                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            <div className="mt-6 flex justify-between items-center text-[10px] font-bold tracking-widest uppercase">
                <span className="text-gray-400">{rateDisplay}</span>
                <span className="text-gray-400">Updated: {lastUpdated ? lastUpdated.split(',')[0] : '...'}</span>
            </div>
        </div>
    );
}
