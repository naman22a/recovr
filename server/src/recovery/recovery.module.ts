import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { RecoveryService } from './recovery.service';
import { RecoveryAttempt } from '../models/recovery-attempt.model';

@Module({
    imports: [MikroOrmModule.forFeature([RecoveryAttempt])],
    providers: [RecoveryService],
    exports: [RecoveryService],
})
export class RecoveryModule {}
