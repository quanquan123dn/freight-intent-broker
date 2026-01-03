import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                orgMemberships: {
                    include: {
                        org: true,
                    },
                },
            },
        });
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async getProfile(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
                orgMemberships: {
                    include: {
                        org: {
                            include: {
                                buyerProfile: true,
                            },
                        },
                    },
                },
            },
        });
    }
}
