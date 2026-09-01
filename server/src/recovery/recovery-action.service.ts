import { Injectable } from '@nestjs/common';
import { RecoveryStrategy } from '../models/recovery-attempt.model';
import { Payment } from '../models/payment.model';

@Injectable()
export class RecoveryActionService {
    async execute(
        strategy: RecoveryStrategy,
        payment: Payment,
    ): Promise<string> {
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

    private async retryPayment(payment: Payment): Promise<string> {
        console.log(`Retrying payment ${payment.razorpayPaymentId}`);

        // Simulation for now.
        // Later this will call the appropriate
        // Razorpay test-mode recovery flow.

        return 'Payment retry simulated';
    }

    private async requestCustomerRetry(payment: Payment): Promise<string> {
        console.log(
            `Requesting customer retry for ${payment.razorpayPaymentId}`,
        );

        return 'Customer retry requested';
    }

    private async createManualReview(payment: Payment): Promise<string> {
        console.log(`Creating manual review for ${payment.razorpayPaymentId}`);

        return 'Manual review created';
    }
}
