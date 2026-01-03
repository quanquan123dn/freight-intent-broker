'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Ship, Package, Truck, Settings, LogOut, ArrowRight, TrendingUp, FileText, Users } from 'lucide-react';

export default function DashboardPage() {
    const { user, logout, isLoading } = useAuth();
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

    if (!user) return null;

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    // Role-based dashboard
    const getDashboardContent = () => {
        switch (user.role) {
            case 'SHIPPER':
                return <ShipperDashboard />;
            case 'BUYER':
                return <BuyerDashboard />;
            case 'ADMIN':
            case 'OPS':
                return <OpsDashboard />;
            default:
                return <ShipperDashboard />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center space-x-2 mb-8">
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                        <Ship className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">FIB</span>
                </div>

                <nav className="space-y-2">
                    {user.role === 'SHIPPER' && (
                        <>
                            <NavLink href="/shipper/rfq/new" icon={<FileText />} label="New Quote" />
                            <NavLink href="/shipper/rfqs" icon={<Package />} label="My RFQs" />
                        </>
                    )}
                    {user.role === 'BUYER' && (
                        <>
                            <NavLink href="/buyer/leads" icon={<TrendingUp />} label="Leads" />
                            <NavLink href="/buyer/subscription" icon={<Package />} label="Subscription" />
                        </>
                    )}
                    {(user.role === 'ADMIN' || user.role === 'OPS') && (
                        <>
                            <NavLink href="/ops/queue" icon={<FileText />} label="RFQ Queue" />
                            <NavLink href="/ops/buyers" icon={<Users />} label="Buyers" />
                            <NavLink href="/ops/deliveries" icon={<TrendingUp />} label="Deliveries" />
                        </>
                    )}
                    <NavLink href="/settings" icon={<Settings />} label="Settings" />
                </nav>

                <div className="absolute bottom-6 left-6 right-6">
                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-700 mb-4">
                        <p className="text-sm text-slate-600 dark:text-slate-300">{user.email}</p>
                        <p className="text-xs text-slate-500 capitalize">{user.role.toLowerCase()}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center space-x-2 py-2 text-slate-600 dark:text-slate-400 hover:text-red-500 transition"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 p-8">
                {getDashboardContent()}
            </main>
        </div>
    );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}

function ShipperDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Dashboard</h1>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Link
                    href="/shipper/rfq/new"
                    className="p-6 rounded-2xl gradient-primary text-white hover:opacity-90 transition group"
                >
                    <h3 className="text-xl font-semibold mb-2">Create New RFQ</h3>
                    <p className="opacity-90 mb-4">Get competitive quotes for your next shipment</p>
                    <div className="flex items-center">
                        <span className="font-medium">Start now</span>
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
                    </div>
                </Link>

                <Link
                    href="/shipper/rfqs"
                    className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition"
                >
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">View My RFQs</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">Track and manage your quote requests</p>
                    <div className="flex items-center text-primary-600">
                        <span className="font-medium">View all</span>
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </div>
                </Link>
            </div>
        </div>
    );
}

function BuyerDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Buyer Dashboard</h1>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <StatCard value="12" label="New Leads" color="primary" />
                <StatCard value="8" label="Revealed Today" color="accent" />
                <StatCard value="45" label="This Month" color="slate" />
            </div>

            <Link
                href="/buyer/leads"
                className="inline-flex items-center px-6 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition"
            >
                View Leads
                <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
        </div>
    );
}

function OpsDashboard() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Operations Dashboard</h1>

            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <StatCard value="24" label="Pending Review" color="primary" />
                <StatCard value="156" label="Verified" color="accent" />
                <StatCard value="89" label="Matched" color="slate" />
                <StatCard value="42" label="Won" color="primary" />
            </div>

            <Link
                href="/ops/queue"
                className="inline-flex items-center px-6 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition"
            >
                Review Queue
                <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
        </div>
    );
}

function StatCard({ value, label, color }: { value: string; label: string; color: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className={`text-3xl font-bold text-${color}-600`}>{value}</div>
            <div className="text-slate-600 dark:text-slate-400">{label}</div>
        </div>
    );
}
