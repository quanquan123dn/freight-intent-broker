'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from '../../messages/en.json';
import vi from '../../messages/vi.json';

type Locale = 'en' | 'vi';
type Messages = typeof en;

interface I18nContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
    messages: Messages;
}

const I18nContext = createContext<I18nContextType | null>(null);

const messagesMap: Record<Locale, Messages> = { en, vi };

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('en');

    useEffect(() => {
        const saved = localStorage.getItem('locale') as Locale;
        if (saved && (saved === 'en' || saved === 'vi')) {
            setLocaleState(saved);
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('locale', newLocale);
    };

    const t = (key: string): string => {
        const keys = key.split('.');
        let value: any = messagesMap[locale];
        for (const k of keys) {
            value = value?.[k];
        }
        return value || key;
    };

    return (
        <I18nContext.Provider value={{ locale, setLocale, t, messages: messagesMap[locale] }}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) throw new Error('useI18n must be used within I18nProvider');
    return context;
}

// Language switcher component
export function LanguageSwitcher() {
    const { locale, setLocale } = useI18n();

    return (
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button
                onClick={() => setLocale('en')}
                className={`px-2 py-1 text-xs font-medium rounded transition ${locale === 'en'
                        ? 'bg-white dark:bg-slate-600 text-primary-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
            >
                EN
            </button>
            <button
                onClick={() => setLocale('vi')}
                className={`px-2 py-1 text-xs font-medium rounded transition ${locale === 'vi'
                        ? 'bg-white dark:bg-slate-600 text-primary-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
            >
                VI
            </button>
        </div>
    );
}
