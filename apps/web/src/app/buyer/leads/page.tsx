'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Ship, Plane, Filter, Eye, MessageSquare, TrendingUp } from 'lucide-react';

interface Lead {
    id: string;
    rfqId: string;
    title: string;
    status: string;
    urgency: string;
    readyDate: string | null;
    route: {
        originCountry: string;
        destCountry: string;
        mode: string;
        tradeLaneKey: string;
    };
    cargo: {
        commodity: string | null;
        weightKg: number | null;
        volumeCbm: number | null;
    } | null;
    score: number;
    matchRank: number;
    matchScore: number;
    createdAt: string;
    contact: {
        contactName: string;
        companyName: string | null;
        email: string;
        phone: string | null;
        isRevealed: boolean;
    };
}

export default function BuyerLeadsPage() {
    const { user, accessToken, isLoading: authLoading } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [revealingId, setRevealingId] = useState<string | null>(null);

    useEffect(() => {
        if (accessToken) {
            api.setAccessToken(accessToken);
            fetchLeads();
        }
    }, [accessToken]);

    const fetchLeads = async () => {
        try {
            const result: any = await api.get('/buyer/leads');
            setLeads(result.data || []);
        } catch (err) {
            console.error('Failed to fetch leads:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReveal = async (rfqId: string) => {
        setRevealingId(rfqId);
        try {
            const result: any = await api.post(`/buyer/leads/${rfqId}/reveal`);
            // Update lead in list
            setLeads((prev) =>
                prev.map((l) =>
                    l.rfqId === rfqId
                        ? {
                            ...l,
                            contact: {
                                ...l.contact,
                                ...result.contact,
                                isRevealed: true,
                            },
                        }
                        : l
                )
            );
            // Update selected lead if same
            if (selectedLead?.rfqId === rfqId) {
                setSelectedLead((prev) =>
                    prev
                        ? {
                            ...prev,
                            contact: { ...prev.contact, ...result.contact, isRevealed: true },
                        }
                        : null
                );
            }
        } catch (err: any) {
            alert(err.message || 'Failed to reveal contact');
        } finally {
            setRevealingId(null);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Matched Leads</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            {leads.length} leads matched to your preferences
                        </p>
                    </div>
                    <button className="flex items-center px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition">
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Lead List */}
                    <div className="lg:col-span-2 space-y-4">
                        {leads.length === 0 ? (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center">
                                <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                    No leads yet
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    New leads matching your preferences will appear here
                                </p>
                            </div>
                        ) : (
                            leads.map((lead) => (
                                <LeadCard
                                    key={lead.id}
                                    lead={lead}
                                    isSelected={selectedLead?.id === lead.id}
                                    onClick={() => setSelectedLead(lead)}
                                    onReveal={() => handleReveal(lead.rfqId)}
                                    isRevealing={revealingId === lead.rfqId}
                                />
                            ))
                        )}
                    </div>

                    {/* Lead Detail */}
                    <div className="lg:col-span-1">
                        {selectedLead ? (
                            <LeadDetail
                                lead={selectedLead}
                                onReveal={() => handleReveal(selectedLead.rfqId)}
                                isRevealing={revealingId === selectedLead.rfqId}
                            />
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center sticky top-8">
                                <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-600 dark:text-slate-400">
                                    Select a lead to view details
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function LeadCard({
    lead,
    isSelected,
    onClick,
    onReveal,
    isRevealing,
}: {
    lead: Lead;
    isSelected: boolean;
    onClick: () => void;
    onReveal: () => void;
    isRevealing: boolean;
}) {
    const ModeIcon = lead.route.mode === 'AIR' ? Plane : Ship;

    return (
        <div
            onClick={onClick}
            className={`bg-white dark:bg-slate-800 rounded-2xl p-6 cursor-pointer transition border-2 ${isSelected
                    ? 'border-primary-500 shadow-lg'
                    : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                }`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                        <ModeIcon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{lead.title}</h3>
                        <p className="text-sm text-slate-500">
                            {lead.route.tradeLaneKey} • Score: {lead.score}
                        </p>
                    </div>
                </div>
                <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${lead.urgency === 'HIGH'
                            ? 'bg-red-100 text-red-600'
                            : lead.urgency === 'MEDIUM'
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-green-100 text-green-600'
                        }`}
                >
                    {lead.urgency}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                    <span className="text-slate-500">Commodity:</span>
                    <span className="ml-2 text-slate-900 dark:text-white">{lead.cargo?.commodity || '-'}</span>
                </div>
                <div>
                    <span className="text-slate-500">Weight:</span>
                    <span className="ml-2 text-slate-900 dark:text-white">
                        {lead.cargo?.weightKg ? `${(lead.cargo.weightKg / 1000).toFixed(1)}t` : '-'}
                    </span>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div className="text-sm">
                    <span className="text-slate-500">Contact:</span>
                    <span className="ml-2 text-slate-900 dark:text-white">
                        {lead.contact.isRevealed ? lead.contact.email : lead.contact.email}
                    </span>
                </div>
                {!lead.contact.isRevealed && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onReveal();
                        }}
                        disabled={isRevealing}
                        className="flex items-center px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                    >
                        {isRevealing ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Eye className="w-4 h-4 mr-1" />
                                Reveal
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

function LeadDetail({
    lead,
    onReveal,
    isRevealing,
}: {
    lead: Lead;
    onReveal: () => void;
    isRevealing: boolean;
}) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sticky top-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{lead.title}</h2>

            <div className="space-y-4">
                <DetailRow label="Route" value={lead.route.tradeLaneKey} />
                <DetailRow label="Mode" value={lead.route.mode} />
                <DetailRow label="Urgency" value={lead.urgency} />
                <DetailRow label="Score" value={`${lead.score}/100`} />
                <DetailRow label="Commodity" value={lead.cargo?.commodity || '-'} />
                <DetailRow
                    label="Weight"
                    value={lead.cargo?.weightKg ? `${lead.cargo.weightKg.toLocaleString()} kg` : '-'}
                />
                <DetailRow
                    label="Volume"
                    value={lead.cargo?.volumeCbm ? `${lead.cargo.volumeCbm} CBM` : '-'}
                />
            </div>

            <hr className="my-6 border-slate-200 dark:border-slate-700" />

            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Contact Information</h3>

            {lead.contact.isRevealed ? (
                <div className="space-y-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/30">
                    <DetailRow label="Name" value={lead.contact.contactName} />
                    <DetailRow label="Company" value={lead.contact.companyName || '-'} />
                    <DetailRow label="Email" value={lead.contact.email} />
                    <DetailRow label="Phone" value={lead.contact.phone || '-'} />
                </div>
            ) : (
                <div className="text-center p-6 rounded-xl bg-slate-100 dark:bg-slate-700">
                    <Eye className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        Contact details are hidden. Reveal to see full information.
                    </p>
                    <button
                        onClick={onReveal}
                        disabled={isRevealing}
                        className="w-full py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
                    >
                        {isRevealing ? 'Revealing...' : 'Reveal Contact (1 credit)'}
                    </button>
                </div>
            )}
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between">
            <span className="text-slate-500">{label}</span>
            <span className="font-medium text-slate-900 dark:text-white">{value}</span>
        </div>
    );
}
