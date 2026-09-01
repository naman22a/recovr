import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { RecoveryService } from './recovery.service';
import { RecoveryAttempt } from '../models/recovery-attempt.model';
import { RecoveryDecisionService } from './recovery-decision.service';

@Module({
    imports: [MikroOrmModule.forFeature([RecoveryAttempt])],
    providers: [RecoveryService, RecoveryDecisionService],
    exports: [RecoveryService, RecoveryDecisionService],
})
export class RecoveryModule {}
