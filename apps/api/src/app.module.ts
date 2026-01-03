import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RfqsModule } from './modules/rfqs/rfqs.module';
import { LeadsModule } from './modules/leads/leads.module';
import { BuyersModule } from './modules/buyers/buyers.module';
import { ScoringModule } from './modules/scoring/scoring.module';
import { MatchingModule } from './modules/matching/matching.module';
import { OpsModule } from './modules/ops/ops.module';

@Module({
    imports: [
        // Config
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.local', '.env'],
        }),

        // Rate limiting
        ThrottlerModule.forRoot([
            {
                name: 'short',
                ttl: 1000,
                limit: 10, // 10 requests per second
            },
            {
                name: 'medium',
                ttl: 10000,
                limit: 50, // 50 requests per 10 seconds
            },
            {
                name: 'long',
                ttl: 60000,
                limit: 100, // 100 requests per minute
            },
        ]),

        // Core
        PrismaModule,

        // Feature modules
        AuthModule,
        UsersModule,
        RfqsModule,
        LeadsModule,
        BuyersModule,
        ScoringModule,
        MatchingModule,
        OpsModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }
