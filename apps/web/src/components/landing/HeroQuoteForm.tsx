'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Ship, Plane, Truck, ArrowRight, MapPin } from 'lucide-react';

const modes = [
    { value: 'sea', label: 'Sea (FCL/LCL)', icon: Ship },
    { value: 'air', label: 'Air Freight', icon: Plane },
    { value: 'road', label: 'Road/Rail', icon: Truck },
];

const incoterms = ['EXW', 'FOB', 'CIF', 'DDP', 'DDU'];

const destinations = [
    { value: 'us', label: '🇺🇸 United States' },
    { value: 'eu', label: '🇪🇺 Europe' },
    { value: 'jp', label: '🇯🇵 Japan' },
    { value: 'kr', label: '🇰🇷 Korea' },
    { value: 'cn', label: '🇨🇳 China' },
    { value: 'sg', label: '🇸🇬 Singapore' },
    { value: 'other', label: '🌏 Other' },
];

export function HeroQuoteForm() {
    const [mode, setMode] = useState('sea');
    const [destination, setDestination] = useState('');
    const [incoterm, setIncoterm] = useState('FOB');

    return (
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                {/* Origin */}
                <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                        Origin
                    </label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                        <MapPin className="w-4 h-4 text-primary-500" />
                        <span className="font-medium text-slate-900 dark:text-white">🇻🇳 Vietnam</span>
                    </div>
                </div>

                {/* Destination */}
                <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                        Destination
                    </label>
                    <select
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                        <option value="">Select country</option>
                        {destinations.map((d) => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                    </select>
                </div>

                {/* Mode */}
                <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                        Mode
                    </label>
                    <div className="flex gap-1 p-1 bg-slate-50 dark:bg-slate-700 rounded-xl">
                        {modes.map((m) => (
                            <button
                                key={m.value}
                                onClick={() => setMode(m.value)}
                                className={`flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition ${mode === m.value
                                        ? 'bg-primary-500 text-white shadow-lg'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
                                    }`}
                            >
                                <m.icon className="w-4 h-4" />
                                <span className="hidden lg:inline">{m.label.split(' ')[0]}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Incoterms */}
                <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                        Incoterms
                    </label>
                    <select
                        value={incoterm}
                        onChange={(e) => setIncoterm(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500"
                    >
                        {incoterms.map((i) => (
                            <option key={i} value={i}>{i}</option>
                        ))}
                    </select>
                </div>

                {/* CTA */}
                <Link
                    href="/shipper/rfq/new"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition shadow-lg shadow-primary-500/30 group"
                >
                    Get Quotes
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </Link>
            </div>

            {/* Shipping keywords */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-2 justify-center text-xs">
                <span className="px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">FCL/LCL</span>
                <span className="px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">HS Code Support</span>
                <span className="px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">ETD/ETA Visibility</span>
                <span className="px-2 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">DG & Reefer</span>
                <span className="px-2 py-1 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">B/L Tracking</span>
            </div>
        </div>
    );
}
