import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import {
    RecoveryAttempt,
    RecoveryAttemptStatus,
} from '../models/recovery-attempt.model';
import { AIRecoveryDecisionService } from './ai/ai-recovery-decision.service';
import { RecoveryService } from './recovery.service';
import { RecoveryStrategy } from '../common/enums';

@Injectable()
export class RecoveryOrchestratorService {
    constructor(
        private readonly aiDecisionService: AIRecoveryDecisionService,
        private readonly recoveryService: RecoveryService,
    ) {}

    async handleFailure(
        attempt: RecoveryAttempt,
        em: EntityManager,
    ): Promise<void> {
        if (attempt.attemptNumber >= attempt.maxAttempts) {
            attempt.status = RecoveryAttemptStatus.STOPPED;
            attempt.result = 'Maximum recovery attempts reached';

            await em.flush();

            console.log(
                `Recovery stopped after ${attempt.attemptNumber} attempts`,
            );

            return;
        }

        const payment = attempt.payment;

        const decision = await this.aiDecisionService.decide({
            paymentId: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            method: payment.method!,
            errorCode: payment.errorCode,
            errorDescription: payment.errorDescription,
            attemptNumber: attempt.attemptNumber + 1,
            maxAttempts: attempt.maxAttempts,
        });

        console.log('Next AI Recovery Decision:', decision);

        if (!Object.values(RecoveryStrategy).includes(decision.strategy)) {
            attempt.status = RecoveryAttemptStatus.STOPPED;
            attempt.result = 'AI returned an unsupported recovery strategy';

            await em.flush();

            console.log(
                `Recovery stopped because AI returned unsupported strategy: ${decision.strategy}`,
            );

            return;
        }

        if (decision.confidence < 0.5) {
            attempt.status = RecoveryAttemptStatus.STOPPED;
            attempt.result = 'AI confidence too low for automatic recovery';

            await em.flush();

            console.log(
                `Recovery stopped because AI confidence was ${decision.confidence}`,
            );

            return;
        }

        await this.recoveryService.createAttempt(
            payment,
            decision.strategy,
            decision.reason,
            em,
        );
    }
}
