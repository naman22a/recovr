/* Shared response types for the NestJS recovery endpoints. No mock data —
   every value on the dashboard is derived from these live responses.
   - RecoveryMetrics     -> GET /recovery/metrics   (fetched in overview.api.ts)
   - RecoveryAttemptRow  -> GET /recovery/history   (fetched in overview.api.ts) */

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

