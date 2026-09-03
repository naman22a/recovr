import { apiGet } from '../../lib/api';
import type { RecoveryAttemptStatus, RecoveryStrategy } from '../../lib/recovery';

/* Response shape of GET /recovery/payments/:paymentId
   (RecoveryAnalyticsService.getPaymentRecovery). Amounts are integer paise. */

export interface PaymentSummary {
    id: number;
    razorpayPaymentId: string;
    amount: number;
    currency: string;
    status: string;
    method: string | null;
    errorCode: string | null;
    errorDescription: string | null;
}

export interface RecoveryAttemptDetail {
    id: number;
    attemptNumber: number;
    maxAttempts: number;
    strategy: RecoveryStrategy;
    confidence: number | null;
    decisionSource: string;
    reason: string | null;
    status: RecoveryAttemptStatus;
    result: string | null;
    failureReason: string | null;
    amountRecovered: number;
    createdAt: string;
    completedAt: string | null;
}

export interface PaymentRecovery {
    payment: PaymentSummary;
    recoveryAttempts: RecoveryAttemptDetail[];
}

/** GET /recovery/payments/:paymentId */
export function fetchPaymentRecovery(
    paymentId: number,
    signal?: AbortSignal,
): Promise<PaymentRecovery> {
    return apiGet<PaymentRecovery>(`/recovery/payments/${paymentId}`, signal);
}
