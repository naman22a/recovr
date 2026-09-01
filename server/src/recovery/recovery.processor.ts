import { Injectable } from '@nestjs/common';
import { WorkerHost, Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EntityManager } from '@mikro-orm/postgresql';
import {
    RecoveryAttempt,
    RecoveryAttemptStatus,
} from '../models/recovery-attempt.model';
import { RECOVERY_QUEUE } from './recovery.queue';

interface RecoveryJob {
    recoveryAttemptId: number;
}

@Processor(RECOVERY_QUEUE)
@Injectable()
export class RecoveryProcessor extends WorkerHost {
    constructor(private readonly em: EntityManager) {
        super();
    }

    async process(job: Job<RecoveryJob>): Promise<void> {
        const { recoveryAttemptId } = job.data;

        console.log(`Processing recovery attempt ${recoveryAttemptId}`);

        try {
            const em = this.em.fork();

            const attempt = await em.findOne(
                RecoveryAttempt,
                {
                    id: recoveryAttemptId,
                },
                {
                    populate: ['payment'],
                },
            );

            if (!attempt) {
                throw new Error(
                    `Recovery attempt ${recoveryAttemptId} not found`,
                );
            }

            if (attempt.status !== RecoveryAttemptStatus.PENDING) {
                console.log(
                    `Recovery attempt ${recoveryAttemptId} is already ${attempt.status}`,
                );

                return;
            }

            attempt.status = RecoveryAttemptStatus.PROCESSING;

            await em.flush();

            console.log({
                attemptId: attempt.id,
                paymentId: attempt.payment.razorpayPaymentId,
                strategy: attempt.strategy,
                reason: attempt.reason,
            });

            // Temporary simulation.
            // Actual recovery action.
            await new Promise((resolve) => setTimeout(resolve, 1000));

            attempt.status = RecoveryAttemptStatus.COMPLETED;

            attempt.result = 'Recovery action simulated successfully';

            attempt.completedAt = new Date();

            await em.flush();

            console.log(`Recovery attempt ${recoveryAttemptId} completed`);
        } catch (error) {
            console.error('Recovery processor failed:', error);
            throw error;
        }
    }
}
