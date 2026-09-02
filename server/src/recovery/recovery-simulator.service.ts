import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Payment } from '../models/payment.model';
import { RecoveryService } from './recovery.service';
import { AIRecoveryDecisionService } from './ai/ai-recovery-decision.service';

@Injectable()
export class RecoverySimulatorService {
    constructor(
        private readonly em: EntityManager,
        private readonly recoveryService: RecoveryService,
        private readonly aiDecisionService: AIRecoveryDecisionService,
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
            const decision = await this.aiDecisionService.decide({
                paymentId: payment.id,
                amount: payment.amount,
                currency: payment.currency,
                method: payment.method!,
                errorCode: payment.errorCode,
                errorDescription: payment.errorDescription,
                attemptNumber: 1,
                maxAttempts: 3,
            });

            console.log('AI Recovery Decision:', decision);

            await this.recoveryService.createAttempt(
                payment,
                decision.strategy,
                decision.reason,
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
        if (index % 5 === 0) {
            return 'GATEWAY_ERROR';
        }

        if (index % 3 === 0) {
            return 'BAD_REQUEST_ERROR';
        }

        return 'PAYMENT_FAILED';
    }

    private getErrorDescription(errorCode: string): string {
        switch (errorCode) {
            case 'GATEWAY_ERROR':
                return 'Temporary gateway failure';

            case 'BAD_REQUEST_ERROR':
                return 'Payment request was rejected';

            default:
                return 'Payment failed';
        }
    }
}
