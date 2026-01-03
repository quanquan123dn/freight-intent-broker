'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
    Ship, Plane, Truck, Train, ArrowRight, CheckCircle, Shield, Zap,
    Menu, X, ChevronDown, FileText, Package, Clock, Star
} from 'lucide-react';
import { LanguageSwitcher, useI18n } from '@/lib/i18n';
import { HeroQuoteForm } from '@/components/landing/HeroQuoteForm';
import { PopularLanes } from '@/components/landing/PopularLanes';

export default function HomePage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [solutionsOpen, setSolutionsOpen] = useState(false);
    const { t } = useI18n();

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                                <Ship className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                                Freight Intent
                            </span>
                        </Link>

                        <nav className="hidden lg:flex items-center space-x-1">
                            <a href="#how-it-works" className="px-4 py-2 text-slate-600 hover:text-primary-600 transition font-medium">
                                {t('nav.howItWorks')}
                            </a>
                            <div className="relative group"
                                onMouseEnter={() => setSolutionsOpen(true)}
                                onMouseLeave={() => setSolutionsOpen(false)}>
                                <button className="px-4 py-2 text-slate-600 hover:text-primary-600 transition font-medium flex items-center">
                                    {t('nav.solutions')} <ChevronDown className="w-4 h-4 ml-1" />
                                </button>
                                {solutionsOpen && (
                                    <div className="absolute top-full left-0 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border p-2">
                                        <Link href="#for-shippers" className="block px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
                                            <div className="font-medium text-slate-900 dark:text-white">{t('nav.forShippers')}</div>
                                        </Link>
                                        <Link href="/register?role=buyer" className="block px-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
                                            <div className="font-medium text-slate-900 dark:text-white">{t('nav.forForwarders')}</div>
                                        </Link>
                                        <hr className="my-2 border-slate-100" />
                                        <a href="#ocean" className="flex items-center px-4 py-2 rounded-lg hover:bg-slate-50 text-slate-600"><Ship className="w-4 h-4 mr-2" />{t('nav.ocean')}</a>
                                        <a href="#air" className="flex items-center px-4 py-2 rounded-lg hover:bg-slate-50 text-slate-600"><Plane className="w-4 h-4 mr-2" />{t('nav.air')}</a>
                                        <a href="#road" className="flex items-center px-4 py-2 rounded-lg hover:bg-slate-50 text-slate-600"><Truck className="w-4 h-4 mr-2" />{t('nav.road')}</a>
                                    </div>
                                )}
                            </div>
                            <a href="#why-us" className="px-4 py-2 text-slate-600 hover:text-primary-600 transition font-medium">{t('nav.whyUs')}</a>
                            <a href="#pricing" className="px-4 py-2 text-slate-600 hover:text-primary-600 transition font-medium">{t('nav.pricing')}</a>
                        </nav>

                        <div className="hidden lg:flex items-center space-x-3">
                            <LanguageSwitcher />
                            <Link href="/shipper/rfq/new" className="px-5 py-2.5 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition shadow-lg shadow-primary-500/25">
                                {t('nav.getFreeQuote')}
                            </Link>
                            <Link href="/login" className="px-4 py-2.5 text-slate-600 hover:text-primary-600 transition font-medium">{t('nav.login')}</Link>
                        </div>

                        <button className="lg:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                    {mobileMenuOpen && (
                        <div className="lg:hidden py-4 border-t border-slate-200">
                            <nav className="flex flex-col space-y-2">
                                <a href="#how-it-works" className="px-4 py-2">{t('nav.howItWorks')}</a>
                                <a href="#pricing" className="px-4 py-2">{t('nav.pricing')}</a>
                                <LanguageSwitcher />
                                <Link href="/shipper/rfq/new" className="px-4 py-3 rounded-xl gradient-primary text-white text-center">{t('nav.getFreeQuote')}</Link>
                            </nav>
                        </div>
                    )}
                </div>
            </header>

            {/* Hero */}
            <section className="pt-28 pb-16 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-6">
                        <Zap className="w-4 h-4 mr-2" /> {t('hero.badge')}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                        {t('hero.title1')}<br />
                        <span className="bg-gradient-to-r from-primary-600 via-accent-500 to-primary-600 bg-clip-text text-transparent">{t('hero.title2')}</span>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
                        {t('hero.description')}
                    </p>
                    <HeroQuoteForm />
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{t('howItWorks.title')}</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">{t('howItWorks.subtitle')}</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <StepCard num="1" title={t('howItWorks.step1.title')} desc={t('howItWorks.step1.description')} />
                        <StepCard num="2" title={t('howItWorks.step2.title')} desc={t('howItWorks.step2.description')} />
                        <StepCard num="3" title={t('howItWorks.step3.title')} desc={t('howItWorks.step3.description')} />
                    </div>
                </div>
            </section>

            <PopularLanes />

            {/* Services */}
            <section id="solutions" className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{t('services.title')}</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ServiceCard icon={<Ship className="w-8 h-8" />} title={t('services.ocean.title')} features={[t('services.ocean.f1'), t('services.ocean.f2'), t('services.ocean.f3'), t('services.ocean.f4')]} />
                        <ServiceCard icon={<Plane className="w-8 h-8" />} title={t('services.air.title')} features={[t('services.air.f1'), t('services.air.f2'), t('services.air.f3'), t('services.air.f4')]} />
                        <ServiceCard icon={<Truck className="w-8 h-8" />} title={t('services.road.title')} features={[t('services.road.f1'), t('services.road.f2'), t('services.road.f3'), t('services.road.f4')]} />
                        <ServiceCard icon={<Package className="w-8 h-8" />} title={t('services.special.title')} features={[t('services.special.f1'), t('services.special.f2'), t('services.special.f3'), t('services.special.f4')]} />
                    </div>
                </div>
            </section>

            {/* Trust Section - Shipping specific */}
            <section className="py-20 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-12 text-white">
                        <div className="text-center mb-10">
                            <Shield className="w-12 h-12 mx-auto mb-4 text-primary-400" />
                            <h2 className="text-3xl font-bold mb-2">{t('trust.title')}</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <TrustItem icon={<FileText />} text="Quote breakdown: Ocean / Local charges / BAF/CAF / Trucking" />
                            <TrustItem icon={<FileText />} text="Documentation: B/L, CO, Commercial Invoice, Packing List" />
                            <TrustItem icon={<CheckCircle />} text="Incoterms clarity: FOB/CIF/DDP & who pays what" />
                            <TrustItem icon={<Shield />} text={t('trust.point4')} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    <StatCard value="500+" label={t('stats.forwarders')} />
                    <StatCard value="10K+" label={t('stats.quotes')} />
                    <StatCard value="50+" label={t('stats.countries')} />
                    <StatCard value="99%" label={t('stats.satisfaction')} />
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 px-4 bg-slate-50 dark:bg-slate-800/50">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">{t('testimonials.title')}</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <TestimonialCard quote={t('testimonials.t1.quote')} author={t('testimonials.t1.author')} company={t('testimonials.t1.company')} />
                        <TestimonialCard quote={t('testimonials.t2.quote')} author={t('testimonials.t2.author')} company={t('testimonials.t2.company')} />
                        <TestimonialCard quote={t('testimonials.t3.quote')} author={t('testimonials.t3.author')} company={t('testimonials.t3.company')} />
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-20 px-4">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">{t('pricing.title')}</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border">
                            <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium mb-4">{t('pricing.shipper.badge')}</span>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('pricing.shipper.title')}</h3>
                            <p className="text-slate-600 mb-6">{t('pricing.shipper.subtitle')}</p>
                            <ul className="space-y-3 mb-8">
                                {[t('pricing.shipper.f1'), t('pricing.shipper.f2'), t('pricing.shipper.f3'), t('pricing.shipper.f4')].map((f, i) => (
                                    <li key={i} className="flex items-center text-slate-600"><CheckCircle className="w-5 h-5 text-green-500 mr-2" />{f}</li>
                                ))}
                            </ul>
                            <Link href="/shipper/rfq/new" className="block w-full py-3 rounded-xl gradient-primary text-white font-semibold text-center">{t('pricing.shipper.cta')}</Link>
                        </div>
                        <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-3xl p-8 shadow-xl text-white">
                            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium mb-4">{t('pricing.forwarder.badge')}</span>
                            <h3 className="text-2xl font-bold mb-2">{t('pricing.forwarder.title')}</h3>
                            <p className="text-white/80 mb-6">{t('pricing.forwarder.subtitle')}</p>
                            <ul className="space-y-3 mb-8">
                                {[t('pricing.forwarder.f1'), t('pricing.forwarder.f2'), t('pricing.forwarder.f3'), t('pricing.forwarder.f4')].map((f, i) => (
                                    <li key={i} className="flex items-center text-white/90"><CheckCircle className="w-5 h-5 text-white/70 mr-2" />{f}</li>
                                ))}
                            </ul>
                            <Link href="/register?role=buyer" className="block w-full py-3 rounded-xl bg-white text-primary-600 font-semibold text-center">{t('pricing.forwarder.cta')}</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="py-20 px-4 bg-slate-50 dark:bg-slate-800/50">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">{t('faq.title')}</h2>
                    <div className="space-y-4">
                        <FAQItem q={t('faq.q1.question')} a={t('faq.q1.answer')} />
                        <FAQItem q={t('faq.q2.question')} a={t('faq.q2.answer')} />
                        <FAQItem q={t('faq.q3.question')} a={t('faq.q3.answer')} />
                        <FAQItem q={t('faq.q4.question')} a={t('faq.q4.answer')} />
                        <FAQItem q={t('faq.q5.question')} a={t('faq.q5.answer')} />
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="rounded-3xl gradient-primary p-12 text-center text-white shadow-2xl">
                        <h2 className="text-3xl font-bold mb-4">{t('cta.title')}</h2>
                        <p className="text-xl opacity-90 mb-8">{t('cta.subtitle')}</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/shipper/rfq/new" className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-white text-primary-600 font-semibold text-lg hover:bg-slate-50 transition shadow-lg">
                                {t('cta.primary')} <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                            <Link href="/register" className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-white/20 text-white font-semibold text-lg hover:bg-white/30 transition border border-white/30">
                                {t('cta.secondary')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 border-t border-slate-200 dark:border-slate-700">
                <div className="max-w-7xl mx-auto text-center text-slate-500">
                    <p>{t('footer.copyright')}</p>
                </div>
            </footer>
        </div>
    );
}

function StepCard({ num, title, desc }: { num: string; title: string; desc: string }) {
    return (
        <div className="relative p-8 rounded-2xl bg-white dark:bg-slate-800 shadow-lg">
            <div className="absolute -top-4 -left-4 w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-white text-xl font-bold shadow-lg">{num}</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3 mt-4">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400">{desc}</p>
        </div>
    );
}

function ServiceCard({ icon, title, features }: { icon: React.ReactNode; title: string; features: string[] }) {
    return (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 group">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-white mb-4 group-hover:scale-110 transition">{icon}</div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{title}</h3>
            <ul className="space-y-2">
                {features.map((f, i) => <li key={i} className="text-slate-600 dark:text-slate-400 text-sm">{f}</li>)}
            </ul>
        </div>
    );
}

function TrustItem({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="flex items-start space-x-3">
            <div className="text-primary-400">{icon}</div>
            <span className="text-slate-300">{text}</span>
        </div>
    );
}

function StatCard({ value, label }: { value: string; label: string }) {
    return (
        <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">{value}</div>
            <div className="text-slate-600 dark:text-slate-400 mt-2">{label}</div>
        </div>
    );
}

function TestimonialCard({ quote, author, company }: { quote: string; author: string; company: string }) {
    return (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border">
            <div className="flex mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}</div>
            <p className="text-slate-700 dark:text-slate-300 mb-4 italic">"{quote}"</p>
            <div><div className="font-semibold text-slate-900 dark:text-white">{author}</div><div className="text-sm text-slate-500">{company}</div></div>
        </div>
    );
}

function FAQItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border overflow-hidden">
            <button onClick={() => setOpen(!open)} className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700">
                <span className="font-medium text-slate-900 dark:text-white">{q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-500 transition ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && <div className="px-6 pb-4 text-slate-600 dark:text-slate-400">{a}</div>}
        </div>
    );
}
