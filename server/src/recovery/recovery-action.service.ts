import { Injectable } from '@nestjs/common';
import { RecoveryStrategy } from '../models/recovery-attempt.model';
import { Payment } from '../models/payment.model';

export type RecoveryOutcome =
    'recovered' | 'waiting_for_customer' | 'failed' | 'manual_review';

export interface RecoveryResult {
    outcome: RecoveryOutcome;
    message: string;
    amountRecovered: number;
}

@Injectable()
export class RecoveryActionService {
    async execute(
        strategy: RecoveryStrategy,
        payment: Payment,
    ): Promise<RecoveryResult> {
        switch (strategy) {
            case RecoveryStrategy.RETRY_PAYMENT:
                return this.retryPayment(payment);

            case RecoveryStrategy.CUSTOMER_RETRY:
                return this.requestCustomerRetry(payment);

            case RecoveryStrategy.MANUAL_REVIEW:
                return this.createManualReview(payment);

            default:
                throw new Error(`Unsupported recovery strategy: ${strategy}`);
        }
    }

    private async retryPayment(payment: Payment): Promise<RecoveryResult> {
        console.log(`Retrying payment ${payment.razorpayPaymentId}`);

        const success = false;

        if (success) {
            return {
                outcome: 'recovered',
                message: 'Payment retry succeeded',
                amountRecovered: payment.amount,
            };
        }

        return {
            outcome: 'failed',
            message: 'Payment retry failed',
            amountRecovered: 0,
        };
    }

    private async requestCustomerRetry(
        payment: Payment,
    ): Promise<RecoveryResult> {
        console.log(
            `Requesting customer retry for ${payment.razorpayPaymentId}`,
        );

        // Simulates sending a payment retry link/message.

        return {
            outcome: 'waiting_for_customer',
            message: 'Customer retry request sent',
            amountRecovered: 0,
        };
    }

    private async createManualReview(
        payment: Payment,
    ): Promise<RecoveryResult> {
        console.log(`Creating manual review for ${payment.razorpayPaymentId}`);

        return {
            outcome: 'manual_review',
            message: 'Manual review created',
            amountRecovered: 0,
        };
    }
}
