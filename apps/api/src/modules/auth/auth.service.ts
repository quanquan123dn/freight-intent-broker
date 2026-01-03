import {
    Injectable,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

interface RegisterDto {
    email: string;
    password: string;
    role: 'SHIPPER' | 'BUYER';
    companyName?: string;
}

interface LoginDto {
    email: string;
    password: string;
}

interface TokenPayload {
    sub: string;
    email: string;
    role: Role;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async register(dto: RegisterDto) {
        // Check if user exists
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existing) {
            throw new ConflictException('Email already registered');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(dto.password, 12);

        // Create user and org in transaction
        const result = await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: dto.email,
                    passwordHash,
                    role: dto.role as Role,
                },
            });

            // Create org for user
            const org = await tx.org.create({
                data: {
                    name: dto.companyName || `${dto.email}'s Organization`,
                    type: dto.role as 'SHIPPER' | 'BUYER',
                    members: {
                        create: {
                            userId: user.id,
                            role: 'owner',
                        },
                    },
                },
            });

            // Create buyer profile if BUYER
            if (dto.role === 'BUYER') {
                await tx.buyerProfile.create({
                    data: {
                        orgId: org.id,
                        companyName: dto.companyName || org.name,
                    },
                });
            }

            return user;
        });

        return this.generateTokens(result, null);
    }

    async login(dto: LoginDto, deviceId?: string | null) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.status !== 'ACTIVE') {
            throw new UnauthorizedException('Account is not active');
        }

        return this.generateTokens(user, deviceId ?? null);
    }

    async refreshTokens(refreshToken: string, deviceId?: string | null) {
        // Hash the incoming token to compare
        const tokenHash = await this.hashToken(refreshToken);

        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        });

        if (!storedToken) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        if (storedToken.expiresAt < new Date()) {
            // Clean up expired token
            await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
            throw new UnauthorizedException('Refresh token expired');
        }

        // Rotate token - delete old, create new
        await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });

        return this.generateTokens(storedToken.user, deviceId ?? null);
    }

    async logout(refreshToken: string) {
        const tokenHash = await this.hashToken(refreshToken);

        await this.prisma.refreshToken.deleteMany({
            where: { tokenHash },
        });

        return { success: true };
    }

    async logoutAll(userId: string) {
        await this.prisma.refreshToken.deleteMany({
            where: { userId },
        });

        return { success: true };
    }

    private async generateTokens(
        user: { id: string; email: string; role: Role },
        deviceId: string | null,
    ) {
        const payload: TokenPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = this.jwtService.sign(payload);

        // Generate refresh token
        const refreshToken = uuidv4();
        const tokenHash = await this.hashToken(refreshToken);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash,
                deviceId,
                expiresAt,
            },
        });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        };
    }

    private async hashToken(token: string): Promise<string> {
        return bcrypt.hash(token, 10);
    }

    async validateUser(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
            },
        });
    }
}
