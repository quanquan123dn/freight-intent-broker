import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { OpsService } from './ops.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('ops')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'OPS')
export class OpsController {
    constructor(private readonly opsService: OpsService) { }

    @Get('rfqs')
    async getRfqs(@Query() query: any) {
        return this.opsService.getRfqs(query);
    }

    @Get('rfqs/:id')
    async getRfqById(@Param('id') id: string) {
        return this.opsService.getRfqById(id);
    }

    @Post('rfqs/:id/approve')
    async approveRfq(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
        @Body('notes') notes?: string,
    ) {
        return this.opsService.approveRfq(id, user.id, notes);
    }

    @Post('rfqs/:id/reject')
    async rejectRfq(
        @Param('id') id: string,
        @CurrentUser() user: { id: string },
        @Body('reason') reason: string,
    ) {
        return this.opsService.rejectRfq(id, user.id, reason);
    }

    @Post('rfqs/:id/score/recompute')
    async recomputeScore(@Param('id') id: string) {
        return this.opsService.recomputeScore(id);
    }

    @Post('rfqs/:id/match/run')
    async runMatching(@Param('id') id: string) {
        return this.opsService.runMatching(id);
    }

    @Get('deliveries')
    async getDeliveryLogs(@Query() query: any) {
        return this.opsService.getDeliveryLogs(query);
    }
}
