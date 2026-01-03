import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TransportMode, Urgency } from '@prisma/client';

interface CreateBuyerDto {
    companyName: string;
    description?: string;
    orgId: string;
    preferences?: {
        modes: TransportMode[];
        lanes: string[];
        commodityTags: string[];
        minVolumeKg?: number;
        maxVolumeKg?: number;
        minVolumeCbm?: number;
        maxVolumeCbm?: number;
        excludedLanes?: string[];
        urgencyAccepted: Urgency[];
    };
}

@Injectable()
export class BuyersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(query: { isActive?: boolean }) {
        return this.prisma.buyerProfile.findMany({
            where: query.isActive !== undefined ? { isActive: query.isActive } : {},
            include: {
                preferences: true,
                org: true,
            },
        });
    }

    async findById(id: string) {
        const buyer = await this.prisma.buyerProfile.findUnique({
            where: { id },
            include: {
                preferences: true,
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

        return buyer;
    }

    async create(dto: CreateBuyerDto) {
        return this.prisma.buyerProfile.create({
            data: {
                orgId: dto.orgId,
                companyName: dto.companyName,
                description: dto.description,
                preferences: dto.preferences
                    ? {
                        create: {
                            modes: dto.preferences.modes,
                            lanes: dto.preferences.lanes,
                            commodityTags: dto.preferences.commodityTags,
                            minVolumeKg: dto.preferences.minVolumeKg,
                            maxVolumeKg: dto.preferences.maxVolumeKg,
                            minVolumeCbm: dto.preferences.minVolumeCbm,
                            maxVolumeCbm: dto.preferences.maxVolumeCbm,
                            excludedLanes: dto.preferences.excludedLanes || [],
                            urgencyAccepted: dto.preferences.urgencyAccepted,
                        },
                    }
                    : undefined,
            },
            include: { preferences: true },
        });
    }

    async updatePreferences(
        buyerId: string,
        preferences: CreateBuyerDto['preferences'],
    ) {
        if (!preferences) {
            throw new Error('Preferences required');
        }

        return this.prisma.buyerPreference.upsert({
            where: { buyerId },
            create: {
                buyerId,
                modes: preferences.modes,
                lanes: preferences.lanes,
                commodityTags: preferences.commodityTags,
                minVolumeKg: preferences.minVolumeKg,
                maxVolumeKg: preferences.maxVolumeKg,
                minVolumeCbm: preferences.minVolumeCbm,
                maxVolumeCbm: preferences.maxVolumeCbm,
                excludedLanes: preferences.excludedLanes || [],
                urgencyAccepted: preferences.urgencyAccepted,
            },
            update: {
                modes: preferences.modes,
                lanes: preferences.lanes,
                commodityTags: preferences.commodityTags,
                minVolumeKg: preferences.minVolumeKg,
                maxVolumeKg: preferences.maxVolumeKg,
                minVolumeCbm: preferences.minVolumeCbm,
                maxVolumeCbm: preferences.maxVolumeCbm,
                excludedLanes: preferences.excludedLanes || [],
                urgencyAccepted: preferences.urgencyAccepted,
            },
        });
    }

    async setActiveStatus(buyerId: string, isActive: boolean) {
        return this.prisma.buyerProfile.update({
            where: { id: buyerId },
            data: { isActive },
        });
    }
}
