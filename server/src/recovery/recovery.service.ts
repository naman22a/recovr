import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import {
    RecoveryAttempt,
    RecoveryAttemptStatus,
    RecoveryStrategy,
} from '../models/recovery-attempt.model';
import { Payment } from '../models/payment.model';
import { Queue } from 'bullmq';
import { RECOVERY_QUEUE } from './recovery.queue';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class RecoveryService {
    constructor(
        private readonly em: EntityManager,
        @InjectQueue(RECOVERY_QUEUE) private readonly recoveryQueue: Queue,
    ) {}

    async createAttempt(
        payment: Payment,
        strategy: RecoveryStrategy,
        reason: string,
    ): Promise<RecoveryAttempt> {
        const previousAttempts = await this.em.find(RecoveryAttempt, {
            payment: payment,
        });
        const attemptNumber = previousAttempts.length + 1;

        const attempt = new RecoveryAttempt();

        attempt.payment = payment;
        attempt.strategy = strategy;
        attempt.reason = reason;
        attempt.status = RecoveryAttemptStatus.PENDING;
        attempt.attemptNumber = attemptNumber;

        this.em.persist(attempt);

        await this.em.flush();

        await this.recoveryQueue.add(
            'process-recovery',
            {
                recoveryAttemptId: attempt.id,
            },
            {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                removeOnComplete: 100,
                removeOnFail: 100,
            },
        );

        return attempt;
    }
}
