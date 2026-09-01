import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Payment } from '../models/payment.model';
import { RecoveryDecisionService } from './recovery-decision.service';
import { RecoveryService } from './recovery.service';

@Injectable()
export class RecoverySimulatorService {
    constructor(
        private readonly em: EntityManager,
        private readonly decisionService: RecoveryDecisionService,
        private readonly recoveryService: RecoveryService,
    ) {}

    async simulate(count = 50) {
        const payments: Payment[] = [];

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

        await this.em.persistAndFlush(payments);

        for (const payment of payments) {
            const decision = this.decisionService.decide(
                payment.errorCode ?? 'PAYMENT_FAILED',
            );

            console.log(
                `Simulation decision for ${payment.razorpayPaymentId}:`,
                decision,
            );

            await this.recoveryService.createAttempt(
                payment,
                decision.strategy,
                decision.reason,
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
