import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { RecoveryService } from './recovery.service';
import { RecoveryAttempt } from '../models/recovery-attempt.model';
import { RecoveryDecisionService } from './recovery-decision.service';
import { BullModule } from '@nestjs/bullmq';
import { RECOVERY_QUEUE } from './recovery.queue';
import { RecoveryProcessor } from './recovery.processor';
import { RecoveryActionService } from './recovery-action.service';

@Module({
    imports: [
        MikroOrmModule.forFeature([RecoveryAttempt]),
        BullModule.registerQueue({
            name: RECOVERY_QUEUE,
        }),
    ],
    providers: [
        RecoveryService,
        RecoveryDecisionService,
        RecoveryProcessor,
        RecoveryActionService,
    ],
    exports: [RecoveryService, RecoveryDecisionService],
})
export class RecoveryModule {}
