'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { TrendingUp, Eye, Calendar, Filter } from 'lucide-react';

const mockDeliveries = [
    { id: '1', rfqTitle: 'FCL Electronics to LA', buyer: 'Global Freight Solutions', revealedAt: '2026-01-03 14:30', status: 'REVEALED' },
    { id: '2', rfqTitle: 'LCL Garments to Hamburg', buyer: 'Euro Express Cargo', revealedAt: '2026-01-03 12:15', status: 'CONTACTED' },
    { id: '3', rfqTitle: 'Air Freight to Tokyo', buyer: 'Japan Freight Network', revealedAt: '2026-01-03 10:00', status: 'WON' },
    { id: '4', rfqTitle: 'Furniture to Sydney', buyer: 'Australia Connect', revealedAt: '2026-01-02 16:45', status: 'LOST' },
    { id: '5', rfqTitle: 'Parts to Seoul', buyer: 'Korea Trade Links', revealedAt: '2026-01-02 15:20', status: 'CONTACTED' },
    { id: '6', rfqTitle: 'Coffee to Dubai', buyer: 'Global Freight Solutions', revealedAt: '2026-01-02 11:00', status: 'REVEALED' },
    { id: '7', rfqTitle: 'Textiles to UK', buyer: 'Euro Express Cargo', revealedAt: '2026-01-01 09:30', status: 'WON' },
    { id: '8', rfqTitle: 'Seafood to Japan', buyer: 'Japan Freight Network', revealedAt: '2026-01-01 08:15', status: 'CONTACTED' },
];

export default function OpsDeliveriesPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

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

    const statusColors: Record<string, string> = {
        REVEALED: 'bg-blue-100 text-blue-600',
        CONTACTED: 'bg-yellow-100 text-yellow-600',
        WON: 'bg-green-100 text-green-600',
        LOST: 'bg-red-100 text-red-600',
    };

    const stats = {
        total: mockDeliveries.length,
        won: mockDeliveries.filter(d => d.status === 'WON').length,
        lost: mockDeliveries.filter(d => d.status === 'LOST').length,
        pending: mockDeliveries.filter(d => ['REVEALED', 'CONTACTED'].includes(d.status)).length,
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Lead Deliveries</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">Track lead reveals and outcomes</p>
                    </div>
                    <button className="flex items-center px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
                        <div className="text-sm text-slate-500">Total Reveals</div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <div className="text-3xl font-bold text-green-600">{stats.won}</div>
                        <div className="text-sm text-slate-500">Won</div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <div className="text-3xl font-bold text-red-500">{stats.lost}</div>
                        <div className="text-sm text-slate-500">Lost</div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
                        <div className="text-3xl font-bold text-yellow-500">{stats.pending}</div>
                        <div className="text-sm text-slate-500">Pending</div>
                    </div>
                </div>

                {/* Deliveries Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700">
                            <tr>
                                <th className="text-left py-4 px-6 text-sm font-medium text-slate-600 dark:text-slate-300">RFQ</th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-slate-600 dark:text-slate-300">Buyer</th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-slate-600 dark:text-slate-300">Revealed At</th>
                                <th className="text-center py-4 px-6 text-sm font-medium text-slate-600 dark:text-slate-300">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockDeliveries.map((delivery, i) => (
                                <tr key={delivery.id} className={`border-t border-slate-100 dark:border-slate-700 ${i % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-slate-700/30'}`}>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-2">
                                            <Eye className="w-4 h-4 text-slate-400" />
                                            <span className="font-medium text-slate-900 dark:text-white">{delivery.rfqTitle}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{delivery.buyer}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-2 text-slate-500">
                                            <Calendar className="w-4 h-4" />
                                            <span>{delivery.revealedAt}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${statusColors[delivery.status]}`}>
                                            {delivery.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
