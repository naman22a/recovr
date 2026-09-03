/* Shared response types for the Overview feature + the mocks not yet wired.
   Shapes mirror the NestJS recovery endpoints:
   - RecoveryMetrics      -> GET /recovery/metrics   (fetched live in overview.api.ts)
   - RecoveryAttemptRow   -> GET /recovery/history   (fetched live in overview.api.ts)
   The AI-decision aggregates below are still mocked. */

import type { RecoveryAttemptStatus, RecoveryStrategy } from '../../lib/recovery';

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

/** One row of GET /recovery/history (RecoveryAnalyticsService.getHistory). */
export interface RecoveryAttemptRow {
    attemptId: number;
    paymentId: number;
    razorpayPaymentId: string;
    amount: number; // paise
    currency: string;
    method: string | null;
    attemptNumber: number;
    maxAttempts: number;
    strategy: RecoveryStrategy;
    confidence: number | null; // 0..1
    decisionSource: 'ai';
    reason: string | null;
    status: RecoveryAttemptStatus;
    result: string | null;
    failureReason: string | null;
    amountRecovered: number; // paise
    createdAt: string; // ISO 8601
    completedAt: string | null; // ISO 8601
}

export interface StrategyShare {
    strategy: RecoveryStrategy;
    label: string;
    count: number;
}

/* Recommended strategy across all AI decisions (sums to 14 total attempts). */
export const strategyDistribution: StrategyShare[] = [
    { strategy: 'retry_payment', label: 'Retry Payment', count: 9 },
    { strategy: 'customer_retry', label: 'Customer Retry', count: 3 },
    { strategy: 'manual_review', label: 'Manual Review', count: 2 },
];

export const aiDecisionSummary = {
    decisions: 14,
    meanConfidence: 0.79,
    clearedSafetyRules: 12,
};
