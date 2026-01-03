'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Ship, ArrowRight, Eye, EyeOff, Truck, Package } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { register } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [role, setRole] = useState<'SHIPPER' | 'BUYER'>(
        searchParams.get('role') === 'buyer' ? 'BUYER' : 'SHIPPER'
    );
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await register(email, password, role, companyName);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center space-x-2">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                            <Ship className="w-7 h-7 text-white" />
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-6">
                        Create your account
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Start shipping smarter today
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
                    {/* Role Selection */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <button
                            type="button"
                            onClick={() => setRole('SHIPPER')}
                            className={`p-4 rounded-xl border-2 transition ${role === 'SHIPPER'
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                                    : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                                }`}
                        >
                            <Package className={`w-8 h-8 mx-auto mb-2 ${role === 'SHIPPER' ? 'text-primary-600' : 'text-slate-400'}`} />
                            <p className={`font-medium ${role === 'SHIPPER' ? 'text-primary-600' : 'text-slate-600 dark:text-slate-400'}`}>
                                Shipper
                            </p>
                            <p className="text-xs text-slate-500 mt-1">I need to ship cargo</p>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('BUYER')}
                            className={`p-4 rounded-xl border-2 transition ${role === 'BUYER'
                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                                    : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                                }`}
                        >
                            <Truck className={`w-8 h-8 mx-auto mb-2 ${role === 'BUYER' ? 'text-primary-600' : 'text-slate-400'}`} />
                            <p className={`font-medium ${role === 'BUYER' ? 'text-primary-600' : 'text-slate-600 dark:text-slate-400'}`}>
                                Forwarder
                            </p>
                            <p className="text-xs text-slate-500 mt-1">I provide freight services</p>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Company Name
                            </label>
                            <input
                                type="text"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                                placeholder="Your Company Ltd"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                                placeholder="you@company.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition pr-12"
                                    placeholder="Min 8 characters"
                                    minLength={8}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition shadow-lg shadow-primary-500/25 disabled:opacity-50 flex items-center justify-center"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
