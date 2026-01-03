import { z } from 'zod';

// Auth DTOs
export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    role: z.enum(['SHIPPER', 'BUYER']),
    companyName: z.string().min(2).optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

export const RefreshTokenSchema = z.object({
    refreshToken: z.string().optional(), // Optional if sent via cookie
});

export type LoginDto = z.infer<typeof LoginSchema>;
export type RegisterDto = z.infer<typeof RegisterSchema>;
export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;

// Auth Responses
export const AuthResponseSchema = z.object({
    accessToken: z.string(),
    user: z.object({
        id: z.string().uuid(),
        email: z.string().email(),
        role: z.enum(['ADMIN', 'OPS', 'SHIPPER', 'BUYER']),
    }),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
