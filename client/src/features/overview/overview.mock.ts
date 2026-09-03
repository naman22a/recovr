/* Local mock data — no API calls yet.
   Shapes mirror the NestJS recovery endpoints:
   - RecoveryMetrics       -> GET /recovery/metrics
   - RecoveryActivityItem  -> GET /recovery/history (row subset)
   Swap these for fetched data when the API layer lands. */

export interface RecoveryMetrics {
    paymentsAtRisk: number;
    totalAmountAtRisk: number;
    totalRecoveryAttempts: number;
    successfulRecoveries: number;
    amountRecovered: number;
    recoveryRate: number;
    waitingForCustomer: number;
    failedRecoveries: number;
    stoppedRecoveries: number;
}

export const overviewMetrics: RecoveryMetrics = {
    paymentsAtRisk: 6,
    totalAmountAtRisk: 2100000,
    totalRecoveryAttempts: 14,
    successfulRecoveries: 4,
    amountRecovered: 1400000,
    recoveryRate: 40,
    waitingForCustomer: 4,
    failedRecoveries: 2,
    stoppedRecoveries: 2,
};

export type RecoveryActivityStatus =
    | 'completed'
    | 'waiting_for_customer'
    | 'failed'
    | 'stopped'
    | 'processing';

export type RecoveryStrategy =
    | 'retry_payment'
    | 'customer_retry'
    | 'manual_review';

export interface RecoveryActivityItem {
    attemptId: number;
    razorpayPaymentId: string;
    amount: number; // paise
    currency: string;
    method: string;
    strategy: RecoveryStrategy;
    attemptNumber: number;
    maxAttempts: number;
    status: RecoveryActivityStatus;
    amountRecovered: number; // paise
    createdAt: string; // ISO 8601
}

export const recentActivity: RecoveryActivityItem[] = [
    {
        attemptId: 5012,
        razorpayPaymentId: 'pay_Nf82kQ1mZ4pLtA',
        amount: 450000,
        currency: 'INR',
        method: 'upi',
        strategy: 'retry_payment',
        attemptNumber: 2,
        maxAttempts: 3,
        status: 'completed',
        amountRecovered: 450000,
        createdAt: '2026-09-03T09:14:00+05:30',
    },
    {
        attemptId: 5011,
        razorpayPaymentId: 'pay_Nf7yTb09Rc2WuX',
        amount: 300000,
        currency: 'INR',
        method: 'card',
        strategy: 'customer_retry',
        attemptNumber: 1,
        maxAttempts: 3,
        status: 'waiting_for_customer',
        amountRecovered: 0,
        createdAt: '2026-09-03T08:47:00+05:30',
    },
    {
        attemptId: 5010,
        razorpayPaymentId: 'pay_Nf6mHk44Ld8vQe',
        amount: 650000,
        currency: 'INR',
        method: 'netbanking',
        strategy: 'retry_payment',
        attemptNumber: 3,
        maxAttempts: 3,
        status: 'failed',
        amountRecovered: 0,
        createdAt: '2026-09-02T21:05:00+05:30',
    },
    {
        attemptId: 5009,
        razorpayPaymentId: 'pay_Nf5aWq7bN1hRkP',
        amount: 500000,
        currency: 'INR',
        method: 'upi',
        strategy: 'retry_payment',
        attemptNumber: 1,
        maxAttempts: 3,
        status: 'completed',
        amountRecovered: 500000,
        createdAt: '2026-09-02T18:32:00+05:30',
    },
    {
        attemptId: 5008,
        razorpayPaymentId: 'pay_Nf4dEr2cV9sLmJ',
        amount: 250000,
        currency: 'INR',
        method: 'wallet',
        strategy: 'manual_review',
        attemptNumber: 1,
        maxAttempts: 1,
        status: 'stopped',
        amountRecovered: 0,
        createdAt: '2026-09-02T16:10:00+05:30',
    },
];
