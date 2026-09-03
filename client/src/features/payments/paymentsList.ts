import type { RecoveryAttemptStatus } from '../../lib/recovery';
import type { RecoveryAttemptRow } from '../overview/overview.mock';

/* The backend has no payments endpoint. This module collapses the rows from
   GET /recovery/history into one entry per payment for the /payments page. */

export interface PaymentRow {
    paymentId: number;
    razorpayPaymentId: string;
    amount: number; // paise
    currency: string;
    method: string | null;
    errorCode: string | null;
    errorDescription: string | null;
    attemptCount: number;
    recoveryStatus: RecoveryAttemptStatus;
    amountRecovered: number; // paise, summed across attempts
}

export type PaymentsListState =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: PaymentRow[] };

/** Derive the displayed recovery status for a payment from its attempts. */
function deriveStatus(attempts: RecoveryAttemptRow[]): RecoveryAttemptStatus {
    if (attempts.some((attempt) => attempt.status === 'completed')) {
        return 'completed';
    }
    if (attempts.some((attempt) => attempt.status === 'waiting_for_customer')) {
        return 'waiting_for_customer';
    }
    const latest = attempts[attempts.length - 1];
    if (latest.status === 'stopped') return 'stopped';
    if (latest.status === 'failed') return 'failed';
    if (latest.status === 'pending') return 'pending';
    return 'processing';
}

/** Collapse recovery-attempt rows into one row per payment. */
export function derivePaymentRows(rows: RecoveryAttemptRow[]): PaymentRow[] {
    const groups = new Map<number, RecoveryAttemptRow[]>();
    for (const row of rows) {
        const existing = groups.get(row.paymentId);
        if (existing) existing.push(row);
        else groups.set(row.paymentId, [row]);
    }

    const payments: PaymentRow[] = [];
    for (const [paymentId, attempts] of groups) {
        const ordered = [...attempts].sort(
            (a, b) =>
                a.attemptNumber - b.attemptNumber ||
                a.createdAt.localeCompare(b.createdAt),
        );
        const head = ordered[0];
        const lastFailure = [...ordered]
            .reverse()
            .find((attempt) => attempt.failureReason);

        payments.push({
            paymentId,
            razorpayPaymentId: head.razorpayPaymentId,
            amount: head.amount,
            currency: head.currency,
            method: head.method,
            // GET /recovery/history does not expose the payment error code.
            errorCode: null,
            errorDescription: lastFailure?.failureReason ?? null,
            attemptCount: ordered.length,
            recoveryStatus: deriveStatus(ordered),
            amountRecovered: ordered.reduce(
                (sum, attempt) => sum + attempt.amountRecovered,
                0,
            ),
        });
    }

    return payments.sort((a, b) => b.paymentId - a.paymentId);
}
