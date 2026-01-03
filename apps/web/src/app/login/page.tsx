'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Ship, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            // Redirect based on role will be handled by middleware
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center space-x-2">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                            <Ship className="w-7 h-7 text-white" />
                        </div>
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-6">
                        Welcome back
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Sign in to your account
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm">
                                {error}
                            </div>
                        )}

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
                                    placeholder="••••••••"
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
                                    Sign In
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                            Sign up free
                        </Link>
                    </div>
                </div>

                {/* Demo accounts */}
                <div className="mt-6 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-sm">
                    <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">Demo Accounts:</p>
                    <div className="space-y-1 text-slate-600 dark:text-slate-400">
                        <p>Admin: admin@fib.com</p>
                        <p>Buyer: buyer1@example.com</p>
                        <p>Shipper: shipper1@export.vn</p>
                        <p className="text-xs mt-2">Password: Password123!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
