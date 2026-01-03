'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { FileText, CheckCircle, XCircle, Play, ChevronRight, Ship, Plane, Search } from 'lucide-react';

// Mock data for demo
const mockRfqs = [
    { id: '1', title: 'FCL 40HC Electronics to LA', status: 'INGESTED', score: 75, urgency: 'HIGH', lane: 'VN-US', mode: 'SEA', createdAt: '2026-01-03' },
    { id: '2', title: 'LCL Garments to Hamburg', status: 'INGESTED', score: 68, urgency: 'MEDIUM', lane: 'VN-DE', mode: 'SEA', createdAt: '2026-01-03' },
    { id: '3', title: 'Air Freight Pharma to Tokyo', status: 'VERIFIED', score: 82, urgency: 'HIGH', lane: 'VN-JP', mode: 'AIR', createdAt: '2026-01-02' },
    { id: '4', title: '2x40FT Furniture to Sydney', status: 'VERIFIED', score: 71, urgency: 'LOW', lane: 'VN-AU', mode: 'SEA', createdAt: '2026-01-02' },
    { id: '5', title: 'Urgent Parts to Seoul', status: 'MATCHED', score: 88, urgency: 'HIGH', lane: 'VN-KR', mode: 'AIR', createdAt: '2026-01-01' },
    { id: '6', title: 'Coffee Export to Dubai', status: 'INGESTED', score: 62, urgency: 'MEDIUM', lane: 'VN-AE', mode: 'SEA', createdAt: '2026-01-03' },
    { id: '7', title: '20FT Textiles to UK', status: 'SPAM_SUSPECTED', score: 25, urgency: 'LOW', lane: 'VN-UK', mode: 'SEA', createdAt: '2026-01-02' },
    { id: '8', title: 'Seafood to Japan', status: 'VERIFIED', score: 79, urgency: 'HIGH', lane: 'VN-JP', mode: 'AIR', createdAt: '2026-01-01' },
];

export default function OpsQueuePage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [filter, setFilter] = useState('ALL');
    const [selectedRfq, setSelectedRfq] = useState<typeof mockRfqs[0] | null>(null);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const filteredRfqs = filter === 'ALL' ? mockRfqs : mockRfqs.filter(r => r.status === filter);

    const statusColors: Record<string, string> = {
        INGESTED: 'bg-blue-100 text-blue-600',
        VERIFIED: 'bg-green-100 text-green-600',
        MATCHED: 'bg-purple-100 text-purple-600',
        SPAM_SUSPECTED: 'bg-red-100 text-red-600',
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">RFQ Review Queue</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            {mockRfqs.filter(r => r.status === 'INGESTED').length} pending review
                        </p>
                    </div>
                    <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 rounded-xl p-1">
                        {['ALL', 'INGESTED', 'VERIFIED', 'MATCHED'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === s
                                        ? 'gradient-primary text-white'
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* RFQ List */}
                    <div className="lg:col-span-2 space-y-3">
                        {filteredRfqs.map((rfq) => {
                            const ModeIcon = rfq.mode === 'AIR' ? Plane : Ship;
                            return (
                                <div
                                    key={rfq.id}
                                    onClick={() => setSelectedRfq(rfq)}
                                    className={`bg-white dark:bg-slate-800 rounded-xl p-4 cursor-pointer transition border-2 ${selectedRfq?.id === rfq.id
                                            ? 'border-primary-500 shadow-lg'
                                            : 'border-transparent hover:border-slate-200'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                                <ModeIcon className="w-5 h-5 text-slate-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-slate-900 dark:text-white">{rfq.title}</h3>
                                                <p className="text-sm text-slate-500">{rfq.lane} • Score: {rfq.score}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColors[rfq.status]}`}>
                                                {rfq.status.replace('_', ' ')}
                                            </span>
                                            <ChevronRight className="w-5 h-5 text-slate-400" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Detail Panel */}
                    <div className="lg:col-span-1">
                        {selectedRfq ? (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sticky top-8">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{selectedRfq.title}</h2>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Status</span>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[selectedRfq.status]}`}>
                                            {selectedRfq.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Score</span>
                                        <span className="font-semibold text-slate-900 dark:text-white">{selectedRfq.score}/100</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Lane</span>
                                        <span className="text-slate-900 dark:text-white">{selectedRfq.lane}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Urgency</span>
                                        <span className={`${selectedRfq.urgency === 'HIGH' ? 'text-red-500' :
                                                selectedRfq.urgency === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500'
                                            }`}>{selectedRfq.urgency}</span>
                                    </div>
                                </div>

                                {selectedRfq.status === 'INGESTED' && (
                                    <div className="space-y-2">
                                        <button className="w-full py-3 rounded-xl gradient-primary text-white font-semibold flex items-center justify-center hover:opacity-90 transition">
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                            Approve
                                        </button>
                                        <button className="w-full py-3 rounded-xl bg-red-100 text-red-600 font-semibold flex items-center justify-center hover:bg-red-200 transition">
                                            <XCircle className="w-5 h-5 mr-2" />
                                            Reject as Spam
                                        </button>
                                    </div>
                                )}

                                {selectedRfq.status === 'VERIFIED' && (
                                    <button className="w-full py-3 rounded-xl gradient-primary text-white font-semibold flex items-center justify-center hover:opacity-90 transition">
                                        <Play className="w-5 h-5 mr-2" />
                                        Run Matching
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center">
                                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-600 dark:text-slate-400">Select an RFQ to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
