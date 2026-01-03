'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api';

interface User {
    id: string;
    email: string;
    role: 'ADMIN' | 'OPS' | 'SHIPPER' | 'BUYER';
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, role: 'SHIPPER' | 'BUYER', companyName?: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Try to refresh on mount
    useEffect(() => {
        const refresh = async () => {
            try {
                const res = await api.post('/auth/refresh');
                setAccessToken(res.accessToken);
                setUser(res.user);
            } catch (e) {
                // Not logged in
            } finally {
                setIsLoading(false);
            }
        };
        refresh();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            setAccessToken(res.accessToken);
            setUser(res.user);
        } catch (e) {
            // Mock login for demo when backend is unavailable
            if (email === 'admin@fib.com' && password === 'Password123!') {
                setUser({ id: 'mock-admin', email, role: 'ADMIN' });
                setAccessToken('mock-token');
            } else if (email === 'buyer1@example.com' && password === 'Password123!') {
                setUser({ id: 'mock-buyer', email, role: 'BUYER' });
                setAccessToken('mock-token');
            } else if (email === 'ops@fib.com' && password === 'Password123!') {
                setUser({ id: 'mock-ops', email, role: 'OPS' });
                setAccessToken('mock-token');
            } else if (email.includes('@export.vn') && password === 'Password123!') {
                setUser({ id: 'mock-shipper', email, role: 'SHIPPER' });
                setAccessToken('mock-token');
            } else {
                throw new Error('Invalid credentials');
            }
        }
    };

    const register = async (email: string, password: string, role: 'SHIPPER' | 'BUYER', companyName?: string) => {
        const res = await api.post('/auth/register', { email, password, confirmPassword: password, role, companyName });
        setAccessToken(res.accessToken);
        setUser(res.user);
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            setAccessToken(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
