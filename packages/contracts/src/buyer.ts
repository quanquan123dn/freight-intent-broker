import { z } from 'zod';

// Lead list query
export const LeadQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    mode: z.enum(['SEA', 'AIR', 'ROAD', 'RAIL', 'MULTIMODAL']).optional(),
    lane: z.string().optional(), // e.g., "VN-US"
    urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    minScore: z.coerce.number().int().min(0).max(100).optional(),
});

// Lead response (PII masked by default)
export const LeadResponseSchema = z.object({
    id: z.string().uuid(),
    rfqId: z.string().uuid(),
    title: z.string(),
    status: z.string(),
    urgency: z.string(),
    readyDate: z.string().datetime().nullable(),
    route: z.object({
        originCountry: z.string(),
        destCountry: z.string(),
        mode: z.string(),
        tradeLaneKey: z.string(),
    }),
    cargo: z.object({
        commodity: z.string().nullable(),
        weightKg: z.number().nullable(),
        volumeCbm: z.number().nullable(),
    }).nullable(),
    score: z.number(),
    matchRank: z.number(),
    matchScore: z.number(),
    createdAt: z.string().datetime(),
    // Contact info - masked unless revealed
    contact: z.object({
        contactName: z.string(), // Always shown
        companyName: z.string().nullable(),
        email: z.string(), // "j***@company.com" if not revealed
        phone: z.string().nullable(), // "***" if not revealed
        isRevealed: z.boolean(),
    }),
});

// Reveal response
export const RevealResponseSchema = z.object({
    success: z.boolean(),
    contact: z.object({
        contactName: z.string(),
        companyName: z.string().nullable(),
        email: z.string().email(),
        phone: z.string().nullable(),
        whatsapp: z.string().nullable(),
    }),
    quotaRemaining: z.number(),
});

// Feedback schema
export const SubmitFeedbackSchema = z.object({
    outcome: z.enum(['WON', 'LOST', 'NO_RESPONSE', 'IN_PROGRESS']),
    notes: z.string().max(1000).optional(),
    dealValue: z.number().positive().optional(),
});

// Subscription response
export const SubscriptionResponseSchema = z.object({
    id: z.string().uuid(),
    plan: z.enum(['BASIC', 'PRO', 'ENTERPRISE']),
    status: z.enum(['ACTIVE', 'CANCELLED', 'EXPIRED', 'PAST_DUE']),
    quotaPerDay: z.number(),
    quotaUsedToday: z.number(),
    quotaRemaining: z.number(),
    exclusiveLanes: z.array(z.string()),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().nullable(),
});

export type LeadQuery = z.infer<typeof LeadQuerySchema>;
export type LeadResponse = z.infer<typeof LeadResponseSchema>;
export type RevealResponse = z.infer<typeof RevealResponseSchema>;
export type SubmitFeedbackDto = z.infer<typeof SubmitFeedbackSchema>;
export type SubscriptionResponse = z.infer<typeof SubscriptionResponseSchema>;
