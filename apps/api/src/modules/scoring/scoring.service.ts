import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface RfqForScoring {
    id: string;
    readyDate: Date | null;
    contact: {
        email: string;
        piiHash: string;
    } | null;
    route: {
        originCountry: string;
        destCountry: string;
    } | null;
    cargo: {
        commodity: string | null;
        weightKg: number | null;
        volumeCbm: number | null;
    } | null;
    notes: string | null;
    title: string;
}

export interface ScoreResult {
    totalScore: number;
    breakdown: Record<string, number>;
}

const FREE_EMAIL_DOMAINS = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'icloud.com',
    'mail.com',
];

const SUSPICIOUS_KEYWORDS = [
    'test',
    'student',
    'sample',
    'demo',
    'trial',
    'fake',
    'need price list',
];

@Injectable()
export class ScoringService {
    constructor(private readonly prisma: PrismaService) { }

    async computeScore(rfq: RfqForScoring): Promise<ScoreResult> {
        const breakdown: Record<string, number> = {};
        let total = 50; // Base score

        // 1. Email domain check (+15 corporate, -10 free)
        if (rfq.contact?.email) {
            const domain = rfq.contact.email.split('@')[1]?.toLowerCase();
            if (domain) {
                if (FREE_EMAIL_DOMAINS.includes(domain)) {
                    breakdown.freeEmailDomain = -10;
                    total -= 10;
                } else {
                    breakdown.corporateEmail = 15;
                    total += 15;
                }
            }
        }

        // 2. Has ready date (+10)
        if (rfq.readyDate) {
            breakdown.hasReadyDate = 10;
            total += 10;
        }

        // 3. Has volume info (+10)
        if (rfq.cargo?.weightKg || rfq.cargo?.volumeCbm) {
            breakdown.hasVolume = 10;
            total += 10;
        }

        // 4. Complete route (+15)
        if (rfq.route?.originCountry && rfq.route?.destCountry) {
            breakdown.completeRoute = 15;
            total += 15;
        }

        // 5. Has commodity (+5)
        if (rfq.cargo?.commodity) {
            breakdown.hasCommodity = 5;
            total += 5;
        }

        // 6. Repeated PII check (-30)
        if (rfq.contact?.piiHash) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const duplicates = await this.prisma.rfqContact.count({
                where: {
                    piiHash: rfq.contact.piiHash,
                    rfq: {
                        id: { not: rfq.id },
                        createdAt: { gte: thirtyDaysAgo },
                    },
                },
            });

            if (duplicates > 0) {
                breakdown.repeatedContact = -30;
                total -= 30;
            }
        }

        // 7. Suspicious keywords (-20)
        const textToCheck = `${rfq.title} ${rfq.notes || ''}`.toLowerCase();
        const hasSuspicious = SUSPICIOUS_KEYWORDS.some((kw) =>
            textToCheck.includes(kw),
        );
        if (hasSuspicious) {
            breakdown.suspiciousKeywords = -20;
            total -= 20;
        }

        // Clamp to 0-100
        total = Math.max(0, Math.min(100, total));

        return { totalScore: total, breakdown };
    }

    async recomputeScore(rfqId: string): Promise<ScoreResult> {
        const rfq = await this.prisma.rfq.findUnique({
            where: { id: rfqId },
            include: {
                contact: true,
                route: true,
                cargo: true,
            },
        });

        if (!rfq) {
            throw new Error('RFQ not found');
        }

        const result = await this.computeScore(rfq);

        await this.prisma.leadScore.upsert({
            where: { rfqId },
            create: {
                rfqId,
                totalScore: result.totalScore,
                breakdown: result.breakdown,
            },
            update: {
                totalScore: result.totalScore,
                breakdown: result.breakdown,
            },
        });

        return result;
    }
}
