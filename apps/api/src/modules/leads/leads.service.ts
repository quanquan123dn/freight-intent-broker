import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DeliveryChannel, FeedbackOutcome } from '@prisma/client';

interface LeadQuery {
    page?: number;
    limit?: number;
    mode?: string;
    lane?: string;
    urgency?: string;
    minScore?: number;
}

@Injectable()
export class LeadsService {
    constructor(private readonly prisma: PrismaService) { }

    async getMatchedLeads(buyerId: string, query: LeadQuery) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {
            buyerId,
            rfq: {
                status: { in: ['VERIFIED', 'MATCHED', 'DISTRIBUTED'] },
            },
        };

        if (query.mode) {
            where.rfq.route = { mode: query.mode };
        }
        if (query.lane) {
            where.rfq.route = { ...where.rfq.route, tradeLaneKey: query.lane };
        }
        if (query.urgency) {
            where.rfq.urgency = query.urgency;
        }
        if (query.minScore) {
            where.rfq.score = { totalScore: { gte: query.minScore } };
        }

        const [matches, total] = await Promise.all([
            this.prisma.match.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ rank: 'asc' }, { createdAt: 'desc' }],
                include: {
                    rfq: {
                        include: {
                            route: true,
                            cargo: true,
                            contact: true,
                            score: true,
                        },
                    },
                },
            }),
            this.prisma.match.count({ where }),
        ]);

        // Check which leads are already revealed
        const rfqIds = matches.map((m) => m.rfqId);
        const deliveries = await this.prisma.leadDelivery.findMany({
            where: {
                buyerId,
                rfqId: { in: rfqIds },
                revealedAt: { not: null },
            },
        });
        const revealedRfqIds = new Set(deliveries.map((d) => d.rfqId));

        // Transform to response format with masked PII
        const leads = matches.map((match) => {
            const rfq = match.rfq;
            const isRevealed = revealedRfqIds.has(rfq.id);

            return {
                id: match.id,
                rfqId: rfq.id,
                title: rfq.title,
                status: rfq.status,
                urgency: rfq.urgency,
                readyDate: rfq.readyDate,
                route: rfq.route
                    ? {
                        originCountry: rfq.route.originCountry,
                        destCountry: rfq.route.destCountry,
                        mode: rfq.route.mode,
                        tradeLaneKey: rfq.route.tradeLaneKey,
                    }
                    : null,
                cargo: rfq.cargo
                    ? {
                        commodity: rfq.cargo.commodity,
                        weightKg: rfq.cargo.weightKg,
                        volumeCbm: rfq.cargo.volumeCbm,
                    }
                    : null,
                score: rfq.score?.totalScore || 0,
                matchRank: match.rank,
                matchScore: match.matchScore,
                createdAt: rfq.createdAt,
                contact: rfq.contact
                    ? {
                        contactName: rfq.contact.contactName,
                        companyName: rfq.contact.companyName,
                        email: isRevealed
                            ? rfq.contact.email
                            : this.maskEmail(rfq.contact.email),
                        phone: isRevealed ? rfq.contact.phone : '***',
                        isRevealed,
                    }
                    : null,
            };
        });

        return {
            data: leads,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // Transaction-safe reveal
    async revealLead(rfqId: string, buyerId: string, userId: string) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Get buyer's org and subscription
            const buyer = await tx.buyerProfile.findUnique({
                where: { id: buyerId },
                include: {
                    org: {
                        include: {
                            subscriptions: {
                                where: { status: 'ACTIVE' },
                                include: { entitlements: true },
                            },
                        },
                    },
                },
            });

            if (!buyer) {
                throw new NotFoundException('Buyer not found');
            }

            const subscription = buyer.org.subscriptions[0];
            if (!subscription) {
                throw new ForbiddenException('No active subscription');
            }

            const entitlement = subscription.entitlements[0];
            if (!entitlement) {
                throw new ForbiddenException('No entitlement found');
            }

            // 2. Calculate quota used today (computed, not stored)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const usedToday = await tx.leadDelivery.count({
                where: {
                    buyerId,
                    revealedAt: { gte: today },
                },
            });

            if (usedToday >= entitlement.quotaPerDay) {
                throw new ForbiddenException(
                    `Daily quota exceeded (${usedToday}/${entitlement.quotaPerDay})`,
                );
            }

            // 3. Check if already revealed
            const existing = await tx.leadDelivery.findUnique({
                where: { rfqId_buyerId: { rfqId, buyerId } },
            });

            if (existing?.revealedAt) {
                // Already revealed, just return the contact
                const contact = await tx.rfqContact.findUnique({
                    where: { rfqId },
                });
                return {
                    success: true,
                    alreadyRevealed: true,
                    contact: contact
                        ? {
                            contactName: contact.contactName,
                            companyName: contact.companyName,
                            email: contact.email,
                            phone: contact.phone,
                            whatsapp: contact.whatsapp,
                        }
                        : null,
                    quotaRemaining: entitlement.quotaPerDay - usedToday,
                };
            }

            // 4. Create or update delivery with revealedAt
            await tx.leadDelivery.upsert({
                where: { rfqId_buyerId: { rfqId, buyerId } },
                create: {
                    rfqId,
                    buyerId,
                    channel: DeliveryChannel.WEB_APP,
                    revealedAt: new Date(),
                },
                update: {
                    revealedAt: new Date(),
                },
            });

            // 5. Log audit
            await tx.auditLog.create({
                data: {
                    userId,
                    action: 'reveal_pii',
                    resource: `rfq:${rfqId}`,
                    details: { buyerId },
                },
            });

            // 6. Add RFQ event
            await tx.rfqEvent.create({
                data: {
                    rfqId,
                    action: 'revealed',
                    actor: buyerId,
                    details: { channel: 'WEB_APP' },
                },
            });

            // 7. Return decrypted PII
            const contact = await tx.rfqContact.findUnique({
                where: { rfqId },
            });

            return {
                success: true,
                alreadyRevealed: false,
                contact: contact
                    ? {
                        contactName: contact.contactName,
                        companyName: contact.companyName,
                        email: contact.email,
                        phone: contact.phone,
                        whatsapp: contact.whatsapp,
                    }
                    : null,
                quotaRemaining: entitlement.quotaPerDay - usedToday - 1,
            };
        });
    }

    async submitFeedback(
        rfqId: string,
        buyerId: string,
        outcome: FeedbackOutcome,
        notes?: string,
        dealValue?: number,
    ) {
        const delivery = await this.prisma.leadDelivery.findUnique({
            where: { rfqId_buyerId: { rfqId, buyerId } },
        });

        if (!delivery) {
            throw new NotFoundException('Lead delivery not found');
        }

        // Upsert feedback
        await this.prisma.buyerFeedback.upsert({
            where: { deliveryId: delivery.id },
            create: {
                deliveryId: delivery.id,
                outcome,
                notes,
                dealValue,
            },
            update: {
                outcome,
                notes,
                dealValue,
            },
        });

        // Update RFQ status if won/lost
        if (outcome === 'WON' || outcome === 'LOST') {
            await this.prisma.rfq.update({
                where: { id: rfqId },
                data: { status: outcome },
            });
        }

        return { success: true };
    }

    async getSubscription(buyerId: string) {
        const buyer = await this.prisma.buyerProfile.findUnique({
            where: { id: buyerId },
            include: {
                org: {
                    include: {
                        subscriptions: {
                            where: { status: 'ACTIVE' },
                            include: { entitlements: true },
                        },
                    },
                },
            },
        });

        if (!buyer) {
            throw new NotFoundException('Buyer not found');
        }

        const subscription = buyer.org.subscriptions[0];
        if (!subscription) {
            return null;
        }

        const entitlement = subscription.entitlements[0];

        // Calculate today's usage
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const usedToday = await this.prisma.leadDelivery.count({
            where: {
                buyerId,
                revealedAt: { gte: today },
            },
        });

        return {
            id: subscription.id,
            plan: subscription.plan,
            status: subscription.status,
            quotaPerDay: entitlement?.quotaPerDay || 0,
            quotaUsedToday: usedToday,
            quotaRemaining: Math.max(0, (entitlement?.quotaPerDay || 0) - usedToday),
            exclusiveLanes: entitlement?.exclusiveLanes || [],
            startDate: subscription.startDate,
            endDate: subscription.endDate,
        };
    }

    private maskEmail(email: string): string {
        const [local, domain] = email.split('@');
        if (!local || !domain) return '***@***.***';
        const masked = local[0] + '***';
        return `${masked}@${domain}`;
    }
}
