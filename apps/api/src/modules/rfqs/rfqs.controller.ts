import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { RfqsService } from './rfqs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SkipThrottle, Throttle } from '@nestjs/throttler';

// Public endpoints for shipper form
@Controller('rfqs')
export class RfqsController {
    constructor(private readonly rfqsService: RfqsService) { }

    // Public: create RFQ from form
    @Post()
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 per minute
    async create(@Body() dto: any) {
        return this.rfqsService.create(dto);
    }

    // Public: verify email OTP
    @Post(':id/verify-email')
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    async verifyEmail(@Param('id') id: string, @Body('otp') otp: string) {
        return this.rfqsService.verifyOtp(id, otp);
    }

    // Public: resend OTP
    @Post(':id/resend-otp')
    @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 per 5 minutes
    async resendOtp(@Param('id') id: string) {
        return this.rfqsService.resendOtp(id);
    }

    // Authenticated: get own RFQ
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getById(@Param('id') id: string, @CurrentUser() user: { id: string }) {
        return this.rfqsService.findById(id, user.id);
    }
}
