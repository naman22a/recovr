import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Payment } from '../models/payment.model';
import { RecoveryService } from './recovery.service';
import { AIRecoveryDecisionService } from './ai/ai-recovery-decision.service';
import { RecoveryOrchestratorService } from './recovery-orchestrator.service';
import { RecoveryAttempt } from '../models/recovery-attempt.model';

@Injectable()
export class RecoverySimulatorService {
    constructor(
        private readonly em: EntityManager,
        private readonly recoveryService: RecoveryService,
        private readonly aiDecisionService: AIRecoveryDecisionService,
        private readonly recoveryOrchestrator: RecoveryOrchestratorService,
    ) {}

    async simulate(count = 50) {
        const payments: Payment[] = [];

        const em = this.em.fork();

        for (let i = 1; i <= count; i++) {
            const payment = new Payment();

            payment.razorpayPaymentId = `sim_pay_${Date.now()}_${i}`;

            payment.amount = this.getAmount(i);

            payment.currency = 'INR';
            payment.status = 'failed';
            payment.method = this.getMethod(i);

            payment.errorCode = this.getErrorCode(i);

            payment.errorDescription = this.getErrorDescription(
                payment.errorCode,
            );

            payments.push(payment);
        }

        await em.persistAndFlush(payments);

        for (const payment of payments) {
            const previousAttempts = await em.find(RecoveryAttempt, {
                payment,
            });

            const decision = await this.aiDecisionService.decide({
                paymentId: payment.id,
                amount: payment.amount,
                currency: payment.currency,
                method: payment.method!,
                errorCode: payment.errorCode,
                errorDescription: payment.errorDescription,
                attemptNumber: 1,
                maxAttempts: 3,
                previousAttempts: previousAttempts.length,
            });

            console.log('AI Recovery Decision:', decision);

            if (!this.recoveryOrchestrator.isDecisionSafe(decision)) {
                console.log(
                    `Recovery stopped for payment ${payment.id}: AI decision failed safety validation`,
                );
                continue;
            }

            await this.recoveryService.createAttempt(
                payment,
                decision.strategy,
                decision.reason,
                decision.confidence,
                em,
            );
        }

        return {
            simulatedPayments: payments.length,
            recoveryAttempts: payments.length,
            message: 'Recovery simulation started',
        };
    }

    private getAmount(index: number): number {
        const amounts = [50000, 100000, 150000, 250000, 500000, 750000];

        return amounts[index % amounts.length];
    }

    private getMethod(index: number): string {
        const methods = ['upi', 'card', 'netbanking'];

        return methods[index % methods.length];
    }

    private getErrorCode(index: number): string {
        const errors = [
            'GATEWAY_ERROR',
            'BAD_REQUEST_ERROR',
            'PAYMENT_FAILED',
            'GATEWAY_ERROR',
            'BAD_REQUEST_ERROR',
        ];

        return errors[index % errors.length];
    }

    private getErrorDescription(errorCode: string): string {
        const descriptions: Record<string, string> = {
            GATEWAY_ERROR: 'Temporary gateway or network error',
            BAD_REQUEST_ERROR: 'Payment request was rejected',
            PAYMENT_FAILED: 'Payment failed',
        };

        return descriptions[errorCode] ?? 'Unknown payment failure';
    }
}
