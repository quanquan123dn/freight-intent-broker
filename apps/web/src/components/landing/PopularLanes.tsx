'use client';

import { Ship, Plane, Truck, Clock, MapPin, CheckCircle } from 'lucide-react';

interface LaneData {
    lane: string;
    flag: string;
    ports: string[];
    transit: string;
    modes: string[];
    bestFor: string[];
    color: string;
}

const lanes: LaneData[] = [
    {
        lane: 'VN → US',
        flag: '🇺🇸',
        ports: ['Cat Lai → LA/LB', 'Hai Phong → NYC'],
        transit: '18-25 days',
        modes: ['FCL', 'LCL', 'Air'],
        bestFor: ['Furniture', 'Garments', 'Electronics'],
        color: 'from-blue-500 to-indigo-600'
    },
    {
        lane: 'VN → EU',
        flag: '🇪🇺',
        ports: ['Cat Lai → Rotterdam', 'HP → Hamburg'],
        transit: '25-35 days',
        modes: ['FCL', 'LCL', 'Rail'],
        bestFor: ['Textiles', 'Footwear', 'Handicrafts'],
        color: 'from-emerald-500 to-teal-600'
    },
    {
        lane: 'VN → Japan/Korea',
        flag: '🇯🇵🇰🇷',
        ports: ['Cat Lai → Tokyo', 'HP → Busan'],
        transit: '5-10 days',
        modes: ['FCL', 'LCL', 'Express'],
        bestFor: ['Seafood', 'Auto parts', 'Machinery'],
        color: 'from-orange-500 to-red-600'
    },
    {
        lane: 'VN → ASEAN',
        flag: '🌏',
        ports: ['Cat Lai → SG', 'Cross-border → CN'],
        transit: '2-7 days',
        modes: ['Trucking', 'LCL', 'Express'],
        bestFor: ['FMCG', 'Raw materials', 'E-commerce'],
        color: 'from-purple-500 to-pink-600'
    }
];

export function PopularLanes() {
    return (
        <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        Popular Lanes From Vietnam
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Verified forwarders with real-time ETD/ETA visibility
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {lanes.map((lane) => (
                        <LaneCard key={lane.lane} data={lane} />
                    ))}
                </div>

                <p className="text-center text-slate-500 dark:text-slate-400 mt-8">
                    Need a custom lane? <a href="/shipper/rfq/new" className="text-primary-600 hover:underline font-medium">Submit your RFQ</a> and we'll match you with specialists.
                </p>
            </div>
        </section>
    );
}

function LaneCard({ data }: { data: LaneData }) {
    return (
        <div className="group relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 overflow-hidden">
            {/* Header with gradient */}
            <div className={`bg-gradient-to-r ${data.color} p-4 text-white`}>
                <div className="flex items-center justify-between">
                    <span className="text-2xl">{data.flag}</span>
                    <span className="text-lg font-bold">{data.lane}</span>
                </div>
                {/* Route line visualization */}
                <div className="mt-3 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/80 border-2 border-white" />
                    <div className="flex-1 h-0.5 bg-white/40 relative">
                        <div className="absolute inset-0 bg-white/80 animate-pulse" style={{ width: '60%' }} />
                    </div>
                    <div className="w-3 h-3 rounded-full bg-white border-2 border-white/60" />
                </div>
            </div>

            <div className="p-4 space-y-3">
                {/* Ports */}
                <div className="space-y-1">
                    {data.ports.map((port, i) => (
                        <div key={i} className="flex items-center text-xs text-slate-600 dark:text-slate-400">
                            <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                            {port}
                        </div>
                    ))}
                </div>

                {/* Transit time chip */}
                <div className="flex items-center gap-2">
                    <div className="inline-flex items-center px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
                        <Clock className="w-3 h-3 mr-1" />
                        {data.transit}
                    </div>
                </div>

                {/* Modes */}
                <div className="flex flex-wrap gap-1">
                    {data.modes.map((mode) => (
                        <span key={mode} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs">
                            {mode}
                        </span>
                    ))}
                </div>

                {/* Best for */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Best for:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {data.bestFor.map((item) => (
                            <span key={item} className="text-xs text-primary-600 dark:text-primary-400">
                                {item}{data.bestFor.indexOf(item) < data.bestFor.length - 1 ? ' •' : ''}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
