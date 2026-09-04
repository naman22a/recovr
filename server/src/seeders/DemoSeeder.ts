import { Seeder } from '@mikro-orm/seeder';
import type { EntityManager } from '@mikro-orm/postgresql';

import { Payment } from '../models/payment.model';
import {
    RecoveryAttempt,
    RecoveryAttemptStatus,
} from '../models/recovery-attempt.model';
import { RecoveryStrategy } from '../common/enums';

export class DemoSeeder extends Seeder {
    async run(em: EntityManager): Promise<void> {
        const payments = [
            {
                razorpayPaymentId: 'pay_demo_001',
                amount: 50000,
                currency: 'INR',
                method: 'upi',
                status: 'failed',
                errorCode: 'GATEWAY_ERROR',
                errorDescription: 'Temporary gateway/network error',
            },
            {
                razorpayPaymentId: 'pay_demo_002',
                amount: 100000,
                currency: 'INR',
                method: 'card',
                status: 'failed',
                errorCode: 'BAD_REQUEST_ERROR',
                errorDescription: 'Payment request was rejected',
            },
            {
                razorpayPaymentId: 'pay_demo_003',
                amount: 150000,
                currency: 'INR',
                method: 'netbanking',
                status: 'failed',
                errorCode: 'PAYMENT_FAILED',
                errorDescription: 'Payment failed during processing',
            },
            {
                razorpayPaymentId: 'pay_demo_004',
                amount: 250000,
                currency: 'INR',
                method: 'card',
                status: 'failed',
                errorCode: 'GATEWAY_ERROR',
                errorDescription: 'Temporary gateway/network error',
            },
            {
                razorpayPaymentId: 'pay_demo_005',
                amount: 500000,
                currency: 'INR',
                method: 'upi',
                status: 'failed',
                errorCode: 'BAD_REQUEST_ERROR',
                errorDescription: 'Payment request was rejected',
            },
            {
                razorpayPaymentId: 'pay_demo_006',
                amount: 750000,
                currency: 'INR',
                method: 'card',
                status: 'failed',
                errorCode: 'PAYMENT_FAILED',
                errorDescription: 'Payment failed during processing',
            },
            {
                razorpayPaymentId: 'pay_demo_007',
                amount: 100000,
                currency: 'INR',
                method: 'upi',
                status: 'failed',
                errorCode: 'GATEWAY_ERROR',
                errorDescription: 'Temporary gateway/network error',
            },
        ];

        for (const data of payments) {
            const payment = em.create(Payment, data);

            switch (data.errorCode) {
                case 'GATEWAY_ERROR':
                    em.create(RecoveryAttempt, {
                        payment,
                        attemptNumber: 1,
                        maxAttempts: 3,
                        strategy: RecoveryStrategy.RETRY_PAYMENT,
                        status: RecoveryAttemptStatus.COMPLETED,
                        confidence: 0.94,
                        reason: 'The failure appears transient and is suitable for a bounded payment retry.',
                        result: 'Payment recovered successfully',
                        amountRecovered: data.amount,
                        completedAt: new Date(),
                    } as any);
                    break;

                case 'BAD_REQUEST_ERROR':
                    em.create(RecoveryAttempt, {
                        payment,
                        attemptNumber: 1,
                        maxAttempts: 3,
                        strategy: RecoveryStrategy.CUSTOMER_RETRY,
                        status: RecoveryAttemptStatus.WAITING_FOR_CUSTOMER,
                        confidence: 0.91,
                        reason: 'The payment request was rejected, so customer action is preferable to an automatic retry.',
                        result: 'Customer retry requested',
                    } as any);
                    break;

                case 'PAYMENT_FAILED':
                    em.create(RecoveryAttempt, {
                        payment,
                        attemptNumber: 1,
                        maxAttempts: 3,
                        strategy: RecoveryStrategy.MANUAL_REVIEW,
                        status: RecoveryAttemptStatus.STOPPED,
                        confidence: 0.87,
                        reason: 'The payment failure does not provide enough evidence for a safe automatic retry.',
                        result: 'Escalated for manual review',
                    } as any);
                    break;
            }
        }

        await em.flush();
    }
}
