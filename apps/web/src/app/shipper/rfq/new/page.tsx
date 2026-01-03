'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Ship, Plane, Truck, Train, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { api } from '@/lib/api';

type Step = 1 | 2 | 3;

interface FormData {
    // Step 1: Route
    originCountry: string;
    originCity: string;
    destCountry: string;
    destCity: string;
    mode: string;
    serviceType: string;
    // Step 2: Cargo
    title: string;
    commodity: string;
    weightKg: number;
    volumeCbm: number;
    containerQty: number;
    containerType: string;
    readyDate: string;
    urgency: string;
    notes: string;
    // Step 3: Contact
    contactName: string;
    companyName: string;
    email: string;
    phone: string;
}

export default function NewRfqPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [rfqId, setRfqId] = useState<string | null>(null);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            urgency: 'MEDIUM',
            mode: 'SEA',
            originCountry: 'VN',
        },
    });

    const mode = watch('mode');

    const onSubmit = async (data: FormData) => {
        if (step < 3) {
            setStep((step + 1) as Step);
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const payload = {
                title: data.title || `${data.mode} shipment to ${data.destCountry}`,
                readyDate: data.readyDate || undefined,
                urgency: data.urgency,
                notes: data.notes,
                route: {
                    originCountry: data.originCountry,
                    originCity: data.originCity,
                    destCountry: data.destCountry,
                    destCity: data.destCity,
                    mode: data.mode,
                    serviceType: data.serviceType,
                },
                cargo: {
                    commodity: data.commodity,
                    weightKg: data.weightKg ? Number(data.weightKg) : undefined,
                    volumeCbm: data.volumeCbm ? Number(data.volumeCbm) : undefined,
                    containerQty: data.containerQty ? Number(data.containerQty) : undefined,
                    containerType: data.containerType,
                },
                contact: {
                    contactName: data.contactName,
                    companyName: data.companyName,
                    email: data.email,
                    phone: data.phone,
                },
            };

            const result: any = await api.post('/rfqs', payload);
            setRfqId(result.id);
            setStep(4 as Step); // Success step
        } catch (err: any) {
            setError(err.message || 'Failed to create RFQ');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (step === 4 as any) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                        RFQ Submitted!
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">
                        Check your email for a verification link. Once verified, your quote request will be matched with suitable forwarders.
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Get Freight Quote
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Fill in your shipment details to receive competitive quotes
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${s <= step
                                        ? 'gradient-primary text-white'
                                        : 'bg-slate-200 text-slate-500'
                                    }`}
                            >
                                {s}
                            </div>
                            {s < 3 && (
                                <div
                                    className={`w-20 h-1 ${s < step ? 'bg-primary-500' : 'bg-slate-200'
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-center text-sm text-slate-600 dark:text-slate-400 mb-8">
                    <span className={step === 1 ? 'font-semibold text-primary-600' : ''}>Route</span>
                    <span className="mx-8">→</span>
                    <span className={step === 2 ? 'font-semibold text-primary-600' : ''}>Cargo</span>
                    <span className="mx-8">→</span>
                    <span className={step === 3 ? 'font-semibold text-primary-600' : ''}>Contact</span>
                </div>

                {/* Form */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        {step === 1 && (
                            <div className="space-y-6 animate-fade-in">
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                                    Route Details
                                </h2>

                                {/* Transport Mode */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                        Transport Mode
                                    </label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {[
                                            { value: 'SEA', icon: Ship, label: 'Sea' },
                                            { value: 'AIR', icon: Plane, label: 'Air' },
                                            { value: 'ROAD', icon: Truck, label: 'Road' },
                                            { value: 'RAIL', icon: Train, label: 'Rail' },
                                        ].map(({ value, icon: Icon, label }) => (
                                            <label
                                                key={value}
                                                className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition ${mode === value
                                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                                                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    value={value}
                                                    {...register('mode')}
                                                    className="sr-only"
                                                />
                                                <Icon className={`w-6 h-6 mb-2 ${mode === value ? 'text-primary-600' : 'text-slate-400'}`} />
                                                <span className={`text-sm font-medium ${mode === value ? 'text-primary-600' : 'text-slate-600'}`}>
                                                    {label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Origin */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Origin Country
                                        </label>
                                        <select
                                            {...register('originCountry', { required: true })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"
                                        >
                                            <option value="VN">Vietnam</option>
                                            <option value="CN">China</option>
                                            <option value="TH">Thailand</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Origin City
                                        </label>
                                        <input
                                            type="text"
                                            {...register('originCity')}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"
                                            placeholder="Ho Chi Minh City"
                                        />
                                    </div>
                                </div>

                                {/* Destination */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Destination Country *
                                        </label>
                                        <select
                                            {...register('destCountry', { required: true })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"
                                        >
                                            <option value="">Select country</option>
                                            <option value="US">United States</option>
                                            <option value="DE">Germany</option>
                                            <option value="UK">United Kingdom</option>
                                            <option value="JP">Japan</option>
                                            <option value="KR">South Korea</option>
                                            <option value="AU">Australia</option>
                                            <option value="CA">Canada</option>
                                            <option value="FR">France</option>
                                            <option value="NL">Netherlands</option>
                                            <option value="SG">Singapore</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Destination City
                                        </label>
                                        <input
                                            type="text"
                                            {...register('destCity')}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"
                                            placeholder="Los Angeles"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6 animate-fade-in">
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                                    Cargo Details
                                </h2>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Shipment Title
                                    </label>
                                    <input
                                        type="text"
                                        {...register('title')}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"
                                        placeholder="e.g., FCL 40HC Electronics to LA"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Commodity / Product
                                    </label>
                                    <input
                                        type="text"
                                        {...register('commodity')}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"
                                        placeholder="Electronics, Garments, Furniture..."
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Weight (kg)
                                        </label>
                                        <input
                                            type="number"
                                            {...register('weightKg')}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"
                                            placeholder="18000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Volume (CBM)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            {...register('volumeCbm')}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"
                                            placeholder="67"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Ready Date
                                        </label>
                                        <input
                                            type="date"
                                            {...register('readyDate')}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Urgency
                                        </label>
                                        <select
                                            {...register('urgency')}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"
                                        >
                                            <option value="LOW">Low - Flexible timing</option>
                                            <option value="MEDIUM">Medium - Standard</option>
                                            <option value="HIGH">High - Urgent</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Additional Notes
                                    </label>
                                    <textarea
                                        {...register('notes')}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"
                                        placeholder="Any special requirements..."
                                    />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 animate-fade-in">
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                                    Contact Information
                                </h2>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Contact Name *
                                        </label>
                                        <input
                                            type="text"
                                            {...register('contactName', { required: true })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                            Company Name
                                        </label>
                                        <input
                                            type="text"
                                            {...register('companyName')}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"
                                            placeholder="Your Company Ltd"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        {...register('email', { required: true })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"
                                        placeholder="you@company.com"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        We'll send a verification code to this email
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        {...register('phone')}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700"
                                        placeholder="+84 901 234 567"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex justify-between mt-8">
                            {step > 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setStep((step - 1) as Step)}
                                    className="flex items-center px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                                >
                                    <ArrowLeft className="w-5 h-5 mr-2" />
                                    Back
                                </button>
                            ) : (
                                <div />
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center px-8 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition shadow-lg shadow-primary-500/25 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : step === 3 ? (
                                    <>
                                        Submit RFQ
                                        <Check className="w-5 h-5 ml-2" />
                                    </>
                                ) : (
                                    <>
                                        Next
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
