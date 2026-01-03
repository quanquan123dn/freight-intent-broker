import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScoringService } from '../scoring/scoring.service';
import { RfqSource, RfqStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

interface CreateRfqDto {
    title: string;
    readyDate?: string;
    latestShipDate?: string;
    urgency?: 'LOW' | 'MEDIUM' | 'HIGH';
    incoterm?: string;
    notes?: string;
    route: {
        originCountry: string;
        originCity?: string;
        originPort?: string;
        destCountry: string;
        destCity?: string;
        destPort?: string;
        mode: 'SEA' | 'AIR' | 'ROAD' | 'RAIL' | 'MULTIMODAL';
        serviceType?: 'DOOR_TO_DOOR' | 'PORT_TO_PORT' | 'DOOR_TO_PORT' | 'PORT_TO_DOOR';
    };
    cargo?: {
        commodity?: string;
        hsCode?: string;
        weightKg?: number;
        volumeCbm?: number;
        containerQty?: number;
        containerType?: string;
        packageCount?: number;
        isDangerous?: boolean;
    };
    contact: {
        contactName: string;
        companyName?: string;
        email: string;
        phone?: string;
        whatsapp?: string;
    };
}

@Injectable()
export class RfqsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly scoringService: ScoringService,
    ) { }

    async create(dto: CreateRfqDto, shipperOrgId?: string) {
        // Generate PII hash for dedupe
        const piiHash = this.generatePiiHash(dto.contact.email, dto.contact.phone);

        // Generate OTP
        const otp = this.generateOtp();
        const otpHash = await bcrypt.hash(otp, 10);
        const otpExpiresAt = new Date();
        otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10);

        // Compute trade lane key
        const tradeLaneKey = `${dto.route.originCountry}-${dto.route.destCountry}`;

        const rfq = await this.prisma.$transaction(async (tx) => {
            // Create RFQ with nested relations
            const created = await tx.rfq.create({
                data: {
                    source: RfqSource.FORM,
                    shipperOrgId,
                    title: dto.title,
                    status: RfqStatus.INGESTED,
                    readyDate: dto.readyDate ? new Date(dto.readyDate) : null,
                    latestShipDate: dto.latestShipDate ? new Date(dto.latestShipDate) : null,
                    urgency: dto.urgency || 'MEDIUM',
                    incoterm: dto.incoterm,
                    notes: dto.notes,
                    route: {
                        create: {
                            originCountry: dto.route.originCountry,
                            originCity: dto.route.originCity,
                            originPort: dto.route.originPort,
                            destCountry: dto.route.destCountry,
                            destCity: dto.route.destCity,
                            destPort: dto.route.destPort,
                            mode: dto.route.mode,
                            serviceType: dto.route.serviceType,
                            tradeLaneKey,
                        },
                    },
                    cargo: dto.cargo
                        ? {
                            create: {
                                commodity: dto.cargo.commodity,
                                hsCode: dto.cargo.hsCode,
                                weightKg: dto.cargo.weightKg,
                                volumeCbm: dto.cargo.volumeCbm,
                                containerQty: dto.cargo.containerQty,
                                containerType: dto.cargo.containerType,
                                packageCount: dto.cargo.packageCount,
                                isDangerous: dto.cargo.isDangerous || false,
                            },
                        }
                        : undefined,
                    contact: {
                        create: {
                            contactName: dto.contact.contactName,
                            companyName: dto.contact.companyName,
                            email: dto.contact.email,
                            phone: dto.contact.phone,
                            whatsapp: dto.contact.whatsapp,
                            piiHash,
                            otpHash,
                            otpExpiresAt,
                        },
                    },
                    events: {
                        create: {
                            action: 'created',
                            actor: shipperOrgId || 'anonymous',
                            details: { source: 'FORM' },
                        },
                    },
                },
                include: {
                    route: true,
                    cargo: true,
                    contact: true,
                },
            });

            // Compute and save score
            const scoreResult = await this.scoringService.computeScore(created);
            await tx.leadScore.create({
                data: {
                    rfqId: created.id,
                    totalScore: scoreResult.totalScore,
                    breakdown: scoreResult.breakdown,
                },
            });

            return created;
        });

        // TODO: Send OTP email
        console.log(`[DEV] OTP for ${dto.contact.email}: ${otp}`);

        return {
            id: rfq.id,
            status: rfq.status,
            title: rfq.title,
            message: 'RFQ created. Please verify your email.',
        };
    }

    async verifyOtp(rfqId: string, otp: string) {
        const rfq = await this.prisma.rfq.findUnique({
            where: { id: rfqId },
            include: { contact: true },
        });

        if (!rfq || !rfq.contact) {
            throw new NotFoundException('RFQ not found');
        }

        if (rfq.contact.verified) {
            return { success: true, message: 'Already verified' };
        }

        if (!rfq.contact.otpHash || !rfq.contact.otpExpiresAt) {
            throw new BadRequestException('No OTP pending');
        }

        if (new Date() > rfq.contact.otpExpiresAt) {
            throw new BadRequestException('OTP expired');
        }

        const isValid = await bcrypt.compare(otp, rfq.contact.otpHash);
        if (!isValid) {
            throw new BadRequestException('Invalid OTP');
        }

        await this.prisma.$transaction([
            this.prisma.rfqContact.update({
                where: { id: rfq.contact.id },
                data: {
                    verified: true,
                    otpHash: null,
                    otpExpiresAt: null,
                },
            }),
            this.prisma.rfqEvent.create({
                data: {
                    rfqId,
                    action: 'email_verified',
                    actor: 'system',
                },
            }),
        ]);

        return { success: true, message: 'Email verified successfully' };
    }

    async findById(rfqId: string, userId?: string) {
        const rfq = await this.prisma.rfq.findUnique({
            where: { id: rfqId },
            include: {
                route: true,
                cargo: true,
                contact: true,
                score: true,
                events: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!rfq) {
            throw new NotFoundException('RFQ not found');
        }

        return rfq;
    }

    async resendOtp(rfqId: string) {
        const rfq = await this.prisma.rfq.findUnique({
            where: { id: rfqId },
            include: { contact: true },
        });

        if (!rfq || !rfq.contact) {
            throw new NotFoundException('RFQ not found');
        }

        if (rfq.contact.verified) {
            throw new BadRequestException('Already verified');
        }

        const otp = this.generateOtp();
        const otpHash = await bcrypt.hash(otp, 10);
        const otpExpiresAt = new Date();
        otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10);

        await this.prisma.rfqContact.update({
            where: { id: rfq.contact.id },
            data: { otpHash, otpExpiresAt },
        });

        // TODO: Send OTP email
        console.log(`[DEV] New OTP for ${rfq.contact.email}: ${otp}`);

        return { success: true, message: 'OTP resent' };
    }

    private generatePiiHash(email: string, phone?: string): string {
        const data = `${email.toLowerCase()}:${phone || ''}`;
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    private generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
}
