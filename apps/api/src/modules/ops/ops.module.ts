import { Module } from '@nestjs/common';
import { OpsService } from './ops.service';
import { OpsController } from './ops.controller';
import { ScoringModule } from '../scoring/scoring.module';
import { MatchingModule } from '../matching/matching.module';

@Module({
    imports: [ScoringModule, MatchingModule],
    controllers: [OpsController],
    providers: [OpsService],
})
export class OpsModule { }
