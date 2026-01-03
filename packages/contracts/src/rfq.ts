import { z } from 'zod';

// RFQ Route Schema
export const RfqRouteSchema = z.object({
    originCountry: z.string().min(2).max(3),
    originCity: z.string().optional(),
    originPort: z.string().optional(),
    destCountry: z.string().min(2).max(3),
    destCity: z.string().optional(),
    destPort: z.string().optional(),
    mode: z.enum(['SEA', 'AIR', 'ROAD', 'RAIL', 'MULTIMODAL']),
    serviceType: z.enum(['DOOR_TO_DOOR', 'PORT_TO_PORT', 'DOOR_TO_PORT', 'PORT_TO_DOOR']).optional(),
});

// RFQ Cargo Schema
export const RfqCargoSchema = z.object({
    commodity: z.string().optional(),
    hsCode: z.string().optional(),
    weightKg: z.number().positive().optional(),
    volumeCbm: z.number().positive().optional(),
    containerQty: z.number().int().positive().optional(),
    containerType: z.string().optional(),
    packageCount: z.number().int().positive().optional(),
    isDangerous: z.boolean().default(false),
});

// RFQ Contact Schema
export const RfqContactSchema = z.object({
    contactName: z.string().min(2),
    companyName: z.string().optional(),
    email: z.string().email(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
});

// Create RFQ Schema (shipper form)
export const CreateRfqSchema = z.object({
    title: z.string().min(5).max(200),
    readyDate: z.string().datetime().optional(),
    latestShipDate: z.string().datetime().optional(),
    urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
    incoterm: z.string().optional(),
    notes: z.string().max(2000).optional(),
    route: RfqRouteSchema,
    cargo: RfqCargoSchema.optional(),
    contact: RfqContactSchema,
});

// Verify OTP Schema
export const VerifyOtpSchema = z.object({
    otp: z.string().length(6),
});

// RFQ Response Schema
export const RfqResponseSchema = z.object({
    id: z.string().uuid(),
    source: z.enum(['FORM', 'EMAIL', 'CRAWL', 'PARTNER', 'MANUAL']),
    title: z.string(),
    status: z.enum(['INGESTED', 'SPAM_SUSPECTED', 'VERIFIED', 'MATCHED', 'DISTRIBUTED', 'IN_NEGOTIATION', 'WON', 'LOST', 'EXPIRED']),
    readyDate: z.string().datetime().nullable(),
    latestShipDate: z.string().datetime().nullable(),
    urgency: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    incoterm: z.string().nullable(),
    notes: z.string().nullable(),
    createdAt: z.string().datetime(),
    route: RfqRouteSchema.nullable(),
    cargo: RfqCargoSchema.nullable(),
    // Contact is optional - only included when revealed
    contact: RfqContactSchema.nullable().optional(),
    score: z.object({
        totalScore: z.number(),
        breakdown: z.record(z.number()),
    }).nullable().optional(),
});

export type RfqRouteDto = z.infer<typeof RfqRouteSchema>;
export type RfqCargoDto = z.infer<typeof RfqCargoSchema>;
export type RfqContactDto = z.infer<typeof RfqContactSchema>;
export type CreateRfqDto = z.infer<typeof CreateRfqSchema>;
export type VerifyOtpDto = z.infer<typeof VerifyOtpSchema>;
export type RfqResponse = z.infer<typeof RfqResponseSchema>;
