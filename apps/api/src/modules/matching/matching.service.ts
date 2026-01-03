import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransportMode, Urgency } from '@prisma/client';

export interface MatchResult {
    buyerId: string;
    companyName: string;
    rank: number;
    matchScore: number;
    matchReason: {
        modeMatch: boolean;
        laneMatch: boolean;
        commodityMatch: boolean;
        volumeMatch: boolean;
        urgencyMatch: boolean;
    };
}

@Injectable()
export class MatchingService {
    constructor(private readonly prisma: PrismaService) { }

    async matchRfqToBuyers(rfqId: string): Promise<MatchResult[]> {
        const rfq = await this.prisma.rfq.findUnique({
            where: { id: rfqId },
            include: {
                route: true,
                cargo: true,
                score: true,
            },
        });

        if (!rfq || !rfq.route) {
            throw new Error('RFQ or route not found');
        }

        // Get all active buyers with preferences
        const buyers = await this.prisma.buyerProfile.findMany({
            where: { isActive: true },
            include: { preferences: true },
        });

        const matches: MatchResult[] = [];

        for (const buyer of buyers) {
            if (!buyer.preferences) continue;

            const pref = buyer.preferences;
            const reason = {
                modeMatch: false,
                laneMatch: false,
                commodityMatch: false,
                volumeMatch: false,
                urgencyMatch: false,
            };

            let score = 0;

            // 1. Mode match (+30)
            if (pref.modes.includes(rfq.route.mode)) {
                reason.modeMatch = true;
                score += 30;
            }

            // 2. Lane match (+30)
            const tradeLane = rfq.route.tradeLaneKey;
            const laneMatches = pref.lanes.some((lane) => {
                if (lane.includes('*')) {
                    const prefix = lane.replace('*', '');
                    return tradeLane.startsWith(prefix);
                }
                return lane === tradeLane;
            });
            const laneExcluded = pref.excludedLanes.includes(tradeLane);

            if (laneMatches && !laneExcluded) {
                reason.laneMatch = true;
                score += 30;
            }

            // 3. Commodity match (+15)
            if (rfq.cargo?.commodity && pref.commodityTags.length > 0) {
                const commodityLower = rfq.cargo.commodity.toLowerCase();
                if (pref.commodityTags.some((tag) => commodityLower.includes(tag.toLowerCase()))) {
                    reason.commodityMatch = true;
                    score += 15;
                }
            } else if (pref.commodityTags.length === 0) {
                // No commodity preference = accepts all
                reason.commodityMatch = true;
                score += 15;
            }

            // 4. Volume match (+15)
            const volumeKg = rfq.cargo?.weightKg;
            const volumeCbm = rfq.cargo?.volumeCbm;
            let volumeMatch = true;

            if (pref.minVolumeKg && volumeKg && volumeKg < pref.minVolumeKg) {
                volumeMatch = false;
            }
            if (pref.maxVolumeKg && volumeKg && volumeKg > pref.maxVolumeKg) {
                volumeMatch = false;
            }
            if (pref.minVolumeCbm && volumeCbm && volumeCbm < pref.minVolumeCbm) {
                volumeMatch = false;
            }
            if (pref.maxVolumeCbm && volumeCbm && volumeCbm > pref.maxVolumeCbm) {
                volumeMatch = false;
            }

            if (volumeMatch) {
                reason.volumeMatch = true;
                score += 15;
            }

            // 5. Urgency match (+10)
            if (pref.urgencyAccepted.includes(rfq.urgency)) {
                reason.urgencyMatch = true;
                score += 10;
            }

            // Only include if minimum match criteria met
            if (score >= 30) {
                matches.push({
                    buyerId: buyer.id,
                    companyName: buyer.companyName,
                    rank: 0, // Will be set after sorting
                    matchScore: score,
                    matchReason: reason,
                });
            }
        }

        // Sort by score descending and assign ranks
        matches.sort((a, b) => b.matchScore - a.matchScore);
        matches.forEach((m, i) => (m.rank = i + 1));

        // Save matches to database
        if (matches.length > 0) {
            await this.prisma.$transaction([
                // Clear existing matches
                this.prisma.match.deleteMany({ where: { rfqId } }),
                // Create new matches
                ...matches.map((m) =>
                    this.prisma.match.create({
                        data: {
                            rfqId,
                            buyerId: m.buyerId,
                            rank: m.rank,
                            matchScore: m.matchScore,
                            matchReason: m.matchReason,
                        },
                    }),
                ),
                // Update RFQ status
                this.prisma.rfq.update({
                    where: { id: rfqId },
                    data: { status: 'MATCHED' },
                }),
                // Add event
                this.prisma.rfqEvent.create({
                    data: {
                        rfqId,
                        action: 'matched',
                        actor: 'system',
                        details: { matchCount: matches.length },
                    },
                }),
            ]);
        }

        return matches;
    }
}
