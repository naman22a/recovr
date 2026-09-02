import { Injectable } from '@nestjs/common';
import { WorkerHost, Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EntityManager } from '@mikro-orm/postgresql';
import {
    RecoveryAttempt,
    RecoveryAttemptStatus,
} from '../models/recovery-attempt.model';
import { RECOVERY_QUEUE } from './recovery.queue';
import { RecoveryActionService } from './recovery-action.service';
import { RecoveryOrchestratorService } from './recovery-orchestrator.service';

interface RecoveryJob {
    recoveryAttemptId: number;
}

@Processor(RECOVERY_QUEUE)
@Injectable()
export class RecoveryProcessor extends WorkerHost {
    constructor(
        private readonly em: EntityManager,
        private readonly recoveryActionService: RecoveryActionService,
        private readonly recoveryOrchestrator: RecoveryOrchestratorService,
    ) {
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

            const result = await this.recoveryActionService.execute(
                attempt.strategy,
                attempt.payment,
            );

            if (result.outcome === 'recovered') {
                attempt.status = RecoveryAttemptStatus.COMPLETED;

                attempt.result = result.message;
                attempt.amountRecovered = result.amountRecovered;
                attempt.completedAt = new Date();

                await em.flush();

                console.log(
                    `Recovery succeeded: ₹${result.amountRecovered / 100}`,
                );

                return;
            }

            if (result.outcome === 'waiting_for_customer') {
                attempt.status = RecoveryAttemptStatus.WAITING_FOR_CUSTOMER;

                attempt.result = result.message;

                await em.flush();

                console.log(
                    `Recovery attempt ${attempt.id} is waiting for customer`,
                );

                return;
            }

            if (result.outcome === 'manual_review') {
                attempt.status = RecoveryAttemptStatus.STOPPED;

                attempt.result = result.message;

                await em.flush();

                console.log(
                    `Recovery attempt ${attempt.id} escalated to manual review`,
                );

                return;
            }

            attempt.failureReason = result.message;

            if (attempt.attemptNumber >= attempt.maxAttempts) {
                attempt.status = RecoveryAttemptStatus.STOPPED;

                attempt.result = 'Maximum recovery attempts reached';

                await em.flush();

                console.log(
                    `Recovery stopped after ${attempt.attemptNumber} attempts`,
                );

                return;
            }

            attempt.status = RecoveryAttemptStatus.FAILED;

            await em.flush();

            console.log(
                `Recovery attempt ${attempt.id} failed: ${result.message}`,
            );

            await this.recoveryOrchestrator.handleFailure(attempt, em);

            return;
        } catch (error) {
            console.error('Recovery processor failed:', error);
            throw error;
        }
    }
}
