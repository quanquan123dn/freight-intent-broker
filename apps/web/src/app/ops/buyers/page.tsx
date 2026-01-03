'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Users, Edit, Trash2, Plus, Ship, Plane, Truck } from 'lucide-react';

const mockBuyers = [
    { id: '1', name: 'Global Freight Solutions', email: 'buyer1@example.com', plan: 'PRO', leads: 45, lanes: ['VN-US', 'VN-EU'], modes: ['SEA'] },
    { id: '2', name: 'Pacific Logistics Co', email: 'buyer2@example.com', plan: 'PRO', leads: 38, lanes: ['VN-US', 'VN-CA'], modes: ['SEA', 'AIR'] },
    { id: '3', name: 'Euro Express Cargo', email: 'buyer3@example.com', plan: 'PRO', leads: 52, lanes: ['VN-EU', 'VN-UK'], modes: ['AIR'] },
    { id: '4', name: 'Japan Freight Network', email: 'buyer4@example.com', plan: 'BASIC', leads: 21, lanes: ['VN-JP'], modes: ['SEA'] },
    { id: '5', name: 'Korea Trade Links', email: 'buyer5@example.com', plan: 'BASIC', leads: 18, lanes: ['VN-KR'], modes: ['SEA', 'AIR'] },
    { id: '6', name: 'Australia Connect', email: 'buyer6@example.com', plan: 'BASIC', leads: 15, lanes: ['VN-AU', 'VN-NZ'], modes: ['SEA'] },
    { id: '7', name: 'China Gateway Logistics', email: 'buyer7@example.com', plan: 'BASIC', leads: 12, lanes: ['VN-CN'], modes: ['ROAD', 'RAIL'] },
    { id: '8', name: 'Southeast Asia Forwarding', email: 'buyer8@example.com', plan: 'BASIC', leads: 28, lanes: ['VN-SG', 'VN-TH'], modes: ['ROAD', 'SEA'] },
];

export default function OpsBuyersPage() {
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

    const modeIcons: Record<string, any> = {
        SEA: Ship,
        AIR: Plane,
        ROAD: Truck,
        RAIL: Truck,
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Buyer Management</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">{mockBuyers.length} registered buyers</p>
                    </div>
                    <button className="flex items-center px-4 py-2 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition">
                        <Plus className="w-5 h-5 mr-2" />
                        Add Buyer
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700">
                            <tr>
                                <th className="text-left py-4 px-6 text-sm font-medium text-slate-600 dark:text-slate-300">Company</th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-slate-600 dark:text-slate-300">Plan</th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-slate-600 dark:text-slate-300">Lanes</th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-slate-600 dark:text-slate-300">Modes</th>
                                <th className="text-center py-4 px-6 text-sm font-medium text-slate-600 dark:text-slate-300">Leads</th>
                                <th className="text-right py-4 px-6 text-sm font-medium text-slate-600 dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockBuyers.map((buyer, i) => (
                                <tr key={buyer.id} className={`border-t border-slate-100 dark:border-slate-700 ${i % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-slate-700/30'}`}>
                                    <td className="py-4 px-6">
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{buyer.name}</p>
                                            <p className="text-sm text-slate-500">{buyer.email}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${buyer.plan === 'PRO' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {buyer.plan}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex flex-wrap gap-1">
                                            {buyer.lanes.map((lane) => (
                                                <span key={lane} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">{lane}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex space-x-1">
                                            {buyer.modes.map((mode) => {
                                                const Icon = modeIcons[mode] || Ship;
                                                return <Icon key={mode} className="w-4 h-4 text-slate-500" />;
                                            })}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className="font-semibold text-slate-900 dark:text-white">{buyer.leads}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex justify-end space-x-2">
                                            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                                <Edit className="w-4 h-4 text-slate-500" />
                                            </button>
                                            <button className="p-2 rounded-lg hover:bg-red-50 transition">
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>
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
