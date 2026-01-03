import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('buyer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('BUYER')
export class LeadsController {
    constructor(
        private readonly leadsService: LeadsService,
        private readonly prisma: PrismaService,
    ) { }

    @Get('leads')
    async getLeads(
        @CurrentUser() user: { id: string },
        @Query() query: any,
    ) {
        const buyerId = await this.getBuyerId(user.id);
        return this.leadsService.getMatchedLeads(buyerId, query);
    }

    @Post('leads/:id/reveal')
    async revealLead(
        @Param('id') rfqId: string,
        @CurrentUser() user: { id: string },
    ) {
        const buyerId = await this.getBuyerId(user.id);
        return this.leadsService.revealLead(rfqId, buyerId, user.id);
    }

    @Post('leads/:id/feedback')
    async submitFeedback(
        @Param('id') rfqId: string,
        @CurrentUser() user: { id: string },
        @Body() body: { outcome: any; notes?: string; dealValue?: number },
    ) {
        const buyerId = await this.getBuyerId(user.id);
        return this.leadsService.submitFeedback(
            rfqId,
            buyerId,
            body.outcome,
            body.notes,
            body.dealValue,
        );
    }

    @Get('subscription')
    async getSubscription(@CurrentUser() user: { id: string }) {
        const buyerId = await this.getBuyerId(user.id);
        return this.leadsService.getSubscription(buyerId);
    }

    private async getBuyerId(userId: string): Promise<string> {
        const orgMember = await this.prisma.orgMember.findFirst({
            where: { userId },
            include: {
                org: {
                    include: { buyerProfile: true },
                },
            },
        });

        if (!orgMember?.org.buyerProfile) {
            throw new Error('Buyer profile not found');
        }

        return orgMember.org.buyerProfile.id;
    }
}
