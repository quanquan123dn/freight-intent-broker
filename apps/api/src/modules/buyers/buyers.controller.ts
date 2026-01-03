import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { BuyersService } from './buyers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('buyers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'OPS')
export class BuyersController {
    constructor(private readonly buyersService: BuyersService) { }

    @Get()
    async findAll(@Query('isActive') isActive?: string) {
        return this.buyersService.findAll({
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        });
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.buyersService.findById(id);
    }

    @Post()
    async create(@Body() dto: any) {
        return this.buyersService.create(dto);
    }

    @Put(':id/preferences')
    async updatePreferences(@Param('id') id: string, @Body() preferences: any) {
        return this.buyersService.updatePreferences(id, preferences);
    }

    @Put(':id/status')
    async setStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
        return this.buyersService.setActiveStatus(id, isActive);
    }
}
