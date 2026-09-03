/* Local mock data — no API calls yet.
   Shape mirrors GET /recovery/payments/:paymentId
   (RecoveryAnalyticsService.getPaymentRecovery). */

import type { RecoveryAttemptStatus, RecoveryStrategy } from '../../lib/recovery';

export interface PaymentSummary {
    id: number;
    razorpayPaymentId: string;
    amount: number; // paise
    currency: string;
    status: string;
    method: string;
    errorCode: string | null;
    errorDescription: string | null;
}

export interface RecoveryAttemptDetail {
    id: number;
    attemptNumber: number;
    maxAttempts: number;
    strategy: RecoveryStrategy;
    confidence: number | null;
    decisionSource: 'ai';
    reason: string | null;
    status: RecoveryAttemptStatus;
    result: string | null;
    failureReason: string | null;
    amountRecovered: number; // paise
    createdAt: string; // ISO 8601
    completedAt: string | null;
}

export interface PaymentRecovery {
    payment: PaymentSummary;
    recoveryAttempts: RecoveryAttemptDetail[];
}

const RECORDS: Record<number, PaymentRecovery> = {
    6: {
        payment: {
            id: 6,
            razorpayPaymentId: 'sim_pay_1788362637655_1',
            amount: 250000,
            currency: 'INR',
            status: 'failed',
            method: 'wallet',
            errorCode: 'PAYMENT_DECLINED',
            errorDescription: 'Insufficient funds',
        },
        recoveryAttempts: [
            {
                id: 21,
                attemptNumber: 1,
                maxAttempts: 3,
                strategy: 'retry_payment',
                confidence: 0.55,
                decisionSource: 'ai',
                reason: 'Insufficient funds often clears within hours; a retry is within the attempt limit.',
                status: 'failed',
                result: null,
                failureReason: 'Retry failed: insufficient balance',
                amountRecovered: 0,
                createdAt: '2026-09-02T16:10:00+05:30',
                completedAt: '2026-09-02T16:10:12+05:30',
            },
            {
                id: 22,
                attemptNumber: 2,
                maxAttempts: 3,
                strategy: 'retry_payment',
                confidence: 0.47,
                decisionSource: 'ai',
                reason: 'Prior retry failed on the same decline; one further attempt is permitted by policy.',
                status: 'failed',
                result: null,
                failureReason: 'Retry failed: insufficient balance',
                amountRecovered: 0,
                createdAt: '2026-09-02T18:40:00+05:30',
                completedAt: '2026-09-02T18:40:11+05:30',
            },
            {
                id: 23,
                attemptNumber: 3,
                maxAttempts: 3,
                strategy: 'retry_payment',
                confidence: 0.38,
                decisionSource: 'ai',
                reason: 'Repeated insufficient-funds failures and the attempt limit is reached; halting automated retries.',
                status: 'stopped',
                result: 'Stopped at attempt limit',
                failureReason: null,
                amountRecovered: 0,
                createdAt: '2026-09-02T21:15:00+05:30',
                completedAt: '2026-09-02T21:15:05+05:30',
            },
        ],
    },

    7: {
        payment: {
            id: 7,
            razorpayPaymentId: 'sim_pay_1788362648870_2',
            amount: 1200000,
            currency: 'INR',
            status: 'failed',
            method: 'netbanking',
            errorCode: 'GATEWAY_ERROR',
            errorDescription: 'Bank server unavailable',
        },
        recoveryAttempts: [
            {
                id: 31,
                attemptNumber: 1,
                maxAttempts: 3,
                strategy: 'retry_payment',
                confidence: 0.72,
                decisionSource: 'ai',
                reason: 'Gateway reported the bank as temporarily unavailable; a retry is likely to succeed.',
                status: 'failed',
                result: null,
                failureReason: 'Retry failed: bank gateway timeout',
                amountRecovered: 0,
                createdAt: '2026-09-02T12:30:00+05:30',
                completedAt: '2026-09-02T12:30:20+05:30',
            },
            {
                id: 32,
                attemptNumber: 2,
                maxAttempts: 3,
                strategy: 'retry_payment',
                confidence: 0.58,
                decisionSource: 'ai',
                reason: 'Bank is still returning gateway errors; one more retry is within the attempt limit.',
                status: 'failed',
                result: null,
                failureReason: 'Retry failed: bank gateway timeout',
                amountRecovered: 0,
                createdAt: '2026-09-02T15:05:00+05:30',
                completedAt: '2026-09-02T15:05:18+05:30',
            },
            {
                id: 33,
                attemptNumber: 3,
                maxAttempts: 3,
                strategy: 'manual_review',
                confidence: 0.34,
                decisionSource: 'ai',
                reason: 'Three consecutive bank-side failures; automated retries are exhausted, escalating for manual review.',
                status: 'stopped',
                result: 'Escalated to manual review',
                failureReason: null,
                amountRecovered: 0,
                createdAt: '2026-09-02T18:20:00+05:30',
                completedAt: '2026-09-02T18:20:04+05:30',
            },
        ],
    },

    8: {
        payment: {
            id: 8,
            razorpayPaymentId: 'sim_pay_1788362659021_3',
            amount: 300000,
            currency: 'INR',
            status: 'failed',
            method: 'card',
            errorCode: 'PAYMENT_DECLINED',
            errorDescription: 'Card declined by issuer',
        },
        recoveryAttempts: [
            {
                id: 41,
                attemptNumber: 1,
                maxAttempts: 3,
                strategy: 'customer_retry',
                confidence: 0.63,
                decisionSource: 'ai',
                reason: 'Issuer declined the charge; a silent retry would fail. Prompting the customer to pay with another method.',
                status: 'waiting_for_customer',
                result: null,
                failureReason: null,
                amountRecovered: 0,
                createdAt: '2026-09-03T08:47:00+05:30',
                completedAt: null,
            },
        ],
    },

    9: {
        payment: {
            id: 9,
            razorpayPaymentId: 'sim_pay_1788362671184_4',
            amount: 500000,
            currency: 'INR',
            status: 'failed',
            method: 'upi',
            errorCode: 'BAD_REQUEST_ERROR',
            errorDescription: 'UPI collect request expired',
        },
        recoveryAttempts: [
            {
                id: 51,
                attemptNumber: 1,
                maxAttempts: 3,
                strategy: 'retry_payment',
                confidence: 0.68,
                decisionSource: 'ai',
                reason: 'The collect request expired before approval; issuing a fresh request to the same VPA.',
                status: 'failed',
                result: null,
                failureReason: 'Retry failed: customer did not approve in time',
                amountRecovered: 0,
                createdAt: '2026-09-02T18:32:00+05:30',
                completedAt: '2026-09-02T18:37:00+05:30',
            },
            {
                id: 52,
                attemptNumber: 2,
                maxAttempts: 3,
                strategy: 'retry_payment',
                confidence: 0.86,
                decisionSource: 'ai',
                reason: 'Customer approved a recent collect on this VPA; a new request has a high success likelihood.',
                status: 'completed',
                result: 'Payment retry succeeded',
                failureReason: null,
                amountRecovered: 500000,
                createdAt: '2026-09-02T20:05:00+05:30',
                completedAt: '2026-09-02T20:06:12+05:30',
            },
        ],
    },

    10: {
        payment: {
            id: 10,
            razorpayPaymentId: 'sim_pay_1788362679299_5',
            amount: 750000,
            currency: 'INR',
            status: 'failed',
            method: 'netbanking',
            errorCode: 'GATEWAY_ERROR',
            errorDescription: 'Bank gateway timeout',
        },
        recoveryAttempts: [
            {
                id: 61,
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
                createdAt: '2026-09-03T09:14:00+05:30',
                completedAt: '2026-09-03T09:14:30+05:30',
            },
        ],
    },

    11: {
        payment: {
            id: 11,
            razorpayPaymentId: 'sim_pay_1788362690118_6',
            amount: 450000,
            currency: 'INR',
            status: 'failed',
            method: 'upi',
            errorCode: 'GATEWAY_ERROR',
            errorDescription: 'Temporary gateway failure at bank',
        },
        recoveryAttempts: [
            {
                id: 71,
                attemptNumber: 1,
                maxAttempts: 3,
                strategy: 'retry_payment',
                confidence: 0.7,
                decisionSource: 'ai',
                reason: 'Transient gateway failure; retrying within the attempt limit.',
                status: 'failed',
                result: null,
                failureReason: 'Retry failed: gateway error',
                amountRecovered: 0,
                createdAt: '2026-09-03T10:40:00+05:30',
                completedAt: '2026-09-03T10:40:15+05:30',
            },
            {
                id: 72,
                attemptNumber: 2,
                maxAttempts: 3,
                strategy: 'retry_payment',
                confidence: 0.78,
                decisionSource: 'ai',
                reason: 'Provider status page shows the gateway recovered; a second retry is warranted.',
                status: 'processing',
                result: null,
                failureReason: null,
                amountRecovered: 0,
                createdAt: '2026-09-03T11:20:00+05:30',
                completedAt: null,
            },
        ],
    },
};

export function getPaymentRecovery(
    paymentId: number,
): PaymentRecovery | undefined {
    return RECORDS[paymentId];
}
