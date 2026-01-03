import { z } from 'zod';

// Ops RFQ Query
export const OpsRfqQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.enum(['INGESTED', 'SPAM_SUSPECTED', 'VERIFIED', 'MATCHED', 'DISTRIBUTED', 'IN_NEGOTIATION', 'WON', 'LOST', 'EXPIRED']).optional(),
    source: z.enum(['FORM', 'EMAIL', 'CRAWL', 'PARTNER', 'MANUAL']).optional(),
    minScore: z.coerce.number().int().min(0).max(100).optional(),
    maxScore: z.coerce.number().int().min(0).max(100).optional(),
    fromDate: z.string().datetime().optional(),
    toDate: z.string().datetime().optional(),
});

// Approve RFQ
export const ApproveRfqSchema = z.object({
    notes: z.string().max(500).optional(),
});

// Reject RFQ
export const RejectRfqSchema = z.object({
    reason: z.string().min(5).max(500),
});

// Buyer Preferences
export const BuyerPreferencesSchema = z.object({
    modes: z.array(z.enum(['SEA', 'AIR', 'ROAD', 'RAIL', 'MULTIMODAL'])),
    lanes: z.array(z.string()), // e.g., ["VN-US", "VN-*"]
    commodityTags: z.array(z.string()),
    minVolumeKg: z.number().positive().optional(),
    maxVolumeKg: z.number().positive().optional(),
    minVolumeCbm: z.number().positive().optional(),
    maxVolumeCbm: z.number().positive().optional(),
    excludedLanes: z.array(z.string()).optional(),
    urgencyAccepted: z.array(z.enum(['LOW', 'MEDIUM', 'HIGH'])),
});

// Create/Update Buyer
export const CreateBuyerSchema = z.object({
    companyName: z.string().min(2),
    description: z.string().optional(),
    orgId: z.string().uuid(),
    preferences: BuyerPreferencesSchema.optional(),
});

// Ops RFQ Response (with full details)
export const OpsRfqResponseSchema = z.object({
    id: z.string().uuid(),
    source: z.string(),
    title: z.string(),
    status: z.string(),
    urgency: z.string(),
    readyDate: z.string().datetime().nullable(),
    latestShipDate: z.string().datetime().nullable(),
    incoterm: z.string().nullable(),
    notes: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    route: z.object({
        originCountry: z.string(),
        originCity: z.string().nullable(),
        originPort: z.string().nullable(),
        destCountry: z.string(),
        destCity: z.string().nullable(),
        destPort: z.string().nullable(),
        mode: z.string(),
        serviceType: z.string().nullable(),
        tradeLaneKey: z.string(),
    }).nullable(),
    cargo: z.object({
        commodity: z.string().nullable(),
        hsCode: z.string().nullable(),
        weightKg: z.number().nullable(),
        volumeCbm: z.number().nullable(),
        containerQty: z.number().nullable(),
        containerType: z.string().nullable(),
        isDangerous: z.boolean(),
    }).nullable(),
    contact: z.object({
        contactName: z.string(),
        companyName: z.string().nullable(),
        email: z.string(),
        phone: z.string().nullable(),
        verified: z.boolean(),
    }),
    score: z.object({
        totalScore: z.number(),
        breakdown: z.record(z.number()),
    }).nullable(),
    events: z.array(z.object({
        action: z.string(),
        actor: z.string().nullable(),
        details: z.any(),
        createdAt: z.string().datetime(),
    })),
});

export type OpsRfqQuery = z.infer<typeof OpsRfqQuerySchema>;
export type ApproveRfqDto = z.infer<typeof ApproveRfqSchema>;
export type RejectRfqDto = z.infer<typeof RejectRfqSchema>;
export type BuyerPreferencesDto = z.infer<typeof BuyerPreferencesSchema>;
export type CreateBuyerDto = z.infer<typeof CreateBuyerSchema>;
export type OpsRfqResponse = z.infer<typeof OpsRfqResponseSchema>;
