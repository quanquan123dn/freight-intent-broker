import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScoringService } from '../scoring/scoring.service';
import { MatchingService } from '../matching/matching.service';
import { RfqStatus } from '@prisma/client';

interface OpsRfqQuery {
    page?: number;
    limit?: number;
    status?: RfqStatus;
    source?: string;
    minScore?: number;
    maxScore?: number;
    fromDate?: string;
    toDate?: string;
}

@Injectable()
export class OpsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly scoringService: ScoringService,
        private readonly matchingService: MatchingService,
    ) { }

    async getRfqs(query: OpsRfqQuery) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (query.status) {
            where.status = query.status;
        }
        if (query.source) {
            where.source = query.source;
        }
        if (query.fromDate || query.toDate) {
            where.createdAt = {};
            if (query.fromDate) where.createdAt.gte = new Date(query.fromDate);
            if (query.toDate) where.createdAt.lte = new Date(query.toDate);
        }
        if (query.minScore || query.maxScore) {
            where.score = {};
            if (query.minScore) where.score.totalScore = { gte: query.minScore };
            if (query.maxScore) where.score.totalScore = { ...where.score.totalScore, lte: query.maxScore };
        }

        const [rfqs, total] = await Promise.all([
            this.prisma.rfq.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    route: true,
                    cargo: true,
                    contact: true,
                    score: true,
                    events: {
                        orderBy: { createdAt: 'desc' },
                        take: 5,
                    },
                },
            }),
            this.prisma.rfq.count({ where }),
        ]);

        return {
            data: rfqs,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getRfqById(id: string) {
        const rfq = await this.prisma.rfq.findUnique({
            where: { id },
            include: {
                route: true,
                cargo: true,
                contact: true,
                score: true,
                attachments: true,
                events: {
                    orderBy: { createdAt: 'desc' },
                },
                matches: {
                    include: { buyer: true },
                    orderBy: { rank: 'asc' },
                },
                deliveries: {
                    include: {
                        buyer: true,
                        feedback: true,
                    },
                },
            },
        });

        if (!rfq) {
            throw new NotFoundException('RFQ not found');
        }

        return rfq;
    }

    async approveRfq(id: string, actorId: string, notes?: string) {
        const rfq = await this.prisma.rfq.findUnique({ where: { id } });
        if (!rfq) throw new NotFoundException('RFQ not found');

        if (rfq.status !== 'INGESTED' && rfq.status !== 'SPAM_SUSPECTED') {
            throw new Error('RFQ cannot be approved in current status');
        }

        await this.prisma.$transaction([
            this.prisma.rfq.update({
                where: { id },
                data: { status: 'VERIFIED' },
            }),
            this.prisma.rfqEvent.create({
                data: {
                    rfqId: id,
                    action: 'approved',
                    actor: actorId,
                    details: notes ? { notes } : undefined,
                },
            }),
        ]);

        return { success: true, status: 'VERIFIED' };
    }

    async rejectRfq(id: string, actorId: string, reason: string) {
        const rfq = await this.prisma.rfq.findUnique({ where: { id } });
        if (!rfq) throw new NotFoundException('RFQ not found');

        await this.prisma.$transaction([
            this.prisma.rfq.update({
                where: { id },
                data: { status: 'SPAM_SUSPECTED' },
            }),
            this.prisma.rfqEvent.create({
                data: {
                    rfqId: id,
                    action: 'rejected',
                    actor: actorId,
                    details: { reason },
                },
            }),
        ]);

        return { success: true, status: 'SPAM_SUSPECTED' };
    }

    async recomputeScore(id: string) {
        return this.scoringService.recomputeScore(id);
    }

    async runMatching(id: string) {
        const rfq = await this.prisma.rfq.findUnique({ where: { id } });
        if (!rfq) throw new NotFoundException('RFQ not found');

        if (rfq.status !== 'VERIFIED') {
            throw new Error('RFQ must be verified before matching');
        }

        return this.matchingService.matchRfqToBuyers(id);
    }

    async getDeliveryLogs(query: { page?: number; limit?: number; buyerId?: string }) {
        const page = query.page || 1;
        const limit = query.limit || 50;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.buyerId) where.buyerId = query.buyerId;

        const [logs, total] = await Promise.all([
            this.prisma.leadDelivery.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    rfq: { select: { id: true, title: true } },
                    buyer: { select: { id: true, companyName: true } },
                    feedback: true,
                },
            }),
            this.prisma.leadDelivery.count({ where }),
        ]);

        return {
            data: logs,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
}
