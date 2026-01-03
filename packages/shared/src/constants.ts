// Shared constants
export const AUTH = {
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY_DAYS: 30,
    OTP_EXPIRY_MINUTES: 10,
    OTP_LENGTH: 6,
} as const;

export const SCORING = {
    MIN_SCORE: 0,
    MAX_SCORE: 100,
    VERIFIED_THRESHOLD: 40,
} as const;

export const QUOTA = {
    BASIC_DAILY: 5,
    PRO_DAILY: 20,
    ENTERPRISE_DAILY: 100,
} as const;

export const TRADE_LANES = {
    POPULAR: ['VN-US', 'VN-EU', 'VN-JP', 'VN-KR', 'VN-CN', 'VN-AU'],
} as const;

export const BLACKLIST_DOMAINS = [
    'test.com',
    'example.com',
    'mailinator.com',
    'tempmail.com',
    'guerrillamail.com',
] as const;

export const FREE_EMAIL_DOMAINS = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'icloud.com',
    'mail.com',
] as const;

export const SUSPICIOUS_KEYWORDS = [
    'test',
    'student',
    'sample',
    'demo',
    'trial',
    'fake',
    'need price list',
] as const;
