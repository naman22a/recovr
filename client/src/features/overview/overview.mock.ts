/* Local mock data — no API calls yet.
   Shapes mirror the NestJS recovery endpoints:
   - RecoveryMetrics      -> GET /recovery/metrics
   - RecoveryAttemptRow   -> GET /recovery/history (row)
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

export type RecoveryAttemptStatus =
    | 'completed'
    | 'waiting_for_customer'
    | 'processing'
    | 'failed'
    | 'stopped';

export type RecoveryStrategy =
    | 'retry_payment'
    | 'customer_retry'
    | 'manual_review';

export interface RecoveryAttemptRow {
    attemptId: number;
    paymentId: number;
    razorpayPaymentId: string;
    amount: number; // paise
    currency: string;
    method: string;
    attemptNumber: number;
    maxAttempts: number;
    strategy: RecoveryStrategy;
    confidence: number; // 0..1
    decisionSource: 'ai';
    reason: string;
    status: RecoveryAttemptStatus;
    result: string | null;
    failureReason: string | null;
    amountRecovered: number; // paise
    // Joined from the originating Payment (errorCode / errorDescription):
    errorCode: string | null;
    errorDescription: string | null;
}

export const recentAttempts: RecoveryAttemptRow[] = [
    {
        attemptId: 15,
        paymentId: 11,
        razorpayPaymentId: 'sim_pay_1788362690118_6',
        amount: 450000,
        currency: 'INR',
        method: 'upi',
        attemptNumber: 1,
        maxAttempts: 3,
        strategy: 'retry_payment',
        confidence: 0.78,
        decisionSource: 'ai',
        reason: 'Transient gateway failure; safe to retry within the attempt limit.',
        status: 'processing',
        result: null,
        failureReason: null,
        amountRecovered: 0,
        errorCode: 'GATEWAY_ERROR',
        errorDescription: 'Temporary gateway failure at bank',
    },
    {
        attemptId: 14,
        paymentId: 10,
        razorpayPaymentId: 'sim_pay_1788362679299_5',
        amount: 750000,
        currency: 'INR',
        method: 'netbanking',
        attemptNumber: 1,
        maxAttempts: 3,
        strategy: 'retry_payment',
        confidence: 1,
        decisionSource: 'ai',
        reason: 'The error is a transient gateway issue and the maximum attempt limit has not been reached.',
        status: 'completed',
        result: 'Payment retry succeeded',
        failureReason: null,
        amountRecovered: 750000,
        errorCode: 'GATEWAY_ERROR',
        errorDescription: 'Bank gateway timeout',
    },
    {
        attemptId: 13,
        paymentId: 9,
        razorpayPaymentId: 'sim_pay_1788362671184_4',
        amount: 500000,
        currency: 'INR',
        method: 'upi',
        attemptNumber: 2,
        maxAttempts: 3,
        strategy: 'retry_payment',
        confidence: 0.86,
        decisionSource: 'ai',
        reason: 'Collect request expired; a fresh retry has a high success likelihood.',
        status: 'completed',
        result: 'Payment retry succeeded',
        failureReason: null,
        amountRecovered: 500000,
        errorCode: 'BAD_REQUEST_ERROR',
        errorDescription: 'UPI collect request expired',
    },
    {
        attemptId: 12,
        paymentId: 8,
        razorpayPaymentId: 'sim_pay_1788362659021_3',
        amount: 300000,
        currency: 'INR',
        method: 'card',
        attemptNumber: 1,
        maxAttempts: 3,
        strategy: 'customer_retry',
        confidence: 0.62,
        decisionSource: 'ai',
        reason: 'Issuer declined the charge; the customer should retry with another method.',
        status: 'waiting_for_customer',
        result: null,
        failureReason: null,
        amountRecovered: 0,
        errorCode: 'PAYMENT_DECLINED',
        errorDescription: 'Card declined by issuer',
    },
    {
        attemptId: 11,
        paymentId: 7,
        razorpayPaymentId: 'sim_pay_1788362648870_2',
        amount: 1200000,
        currency: 'INR',
        method: 'netbanking',
        attemptNumber: 3,
        maxAttempts: 3,
        strategy: 'manual_review',
        confidence: 0.34,
        decisionSource: 'ai',
        reason: 'Repeated bank-side failures and the attempt limit is reached; needs manual review.',
        status: 'stopped',
        result: 'Escalated to manual review',
        failureReason: null,
        amountRecovered: 0,
        errorCode: 'GATEWAY_ERROR',
        errorDescription: 'Bank server unavailable',
    },
    {
        attemptId: 10,
        paymentId: 6,
        razorpayPaymentId: 'sim_pay_1788362637655_1',
        amount: 250000,
        currency: 'INR',
        method: 'wallet',
        attemptNumber: 3,
        maxAttempts: 3,
        strategy: 'retry_payment',
        confidence: 0.51,
        decisionSource: 'ai',
        reason: 'Balance may have been topped up since the failure; one final retry is warranted.',
        status: 'failed',
        result: null,
        failureReason: 'Retry failed: insufficient wallet balance',
        amountRecovered: 0,
        errorCode: 'PAYMENT_DECLINED',
        errorDescription: 'Insufficient funds',
    },
];
