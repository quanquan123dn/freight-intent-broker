import { Module } from '@nestjs/common';
import { RfqsService } from './rfqs.service';
import { RfqsController } from './rfqs.controller';
import { ScoringModule } from '../scoring/scoring.module';

@Module({
    imports: [ScoringModule],
    controllers: [RfqsController],
    providers: [RfqsService],
    exports: [RfqsService],
})
export class RfqsModule { }
