/* Shared recovery domain vocabulary — mirrors the backend enums
   (RecoveryStrategy, RecoveryAttemptStatus) and the labels/classes the
   UI renders for them. One source of truth for badges across features. */

export type RecoveryStrategy =
    | 'retry_payment'
    | 'customer_retry'
    | 'manual_review';

export type RecoveryAttemptStatus =
    | 'completed'
    | 'waiting_for_customer'
    | 'processing'
    | 'failed'
    | 'stopped';

export const STRATEGY_META: Record<
    RecoveryStrategy,
    { label: string; badgeClass: string }
> = {
    retry_payment: {
        label: 'Retry Payment',
        badgeClass: 'badge--strategy strategy--retry',
    },
    customer_retry: {
        label: 'Customer Retry',
        badgeClass: 'badge--strategy strategy--customer',
    },
    manual_review: {
        label: 'Manual Review',
        badgeClass: 'badge--strategy strategy--manual',
    },
};

export const STATUS_META: Record<
    RecoveryAttemptStatus,
    { label: string; badgeClass: string; tone: string }
> = {
    completed: {
        label: 'Recovered',
        badgeClass: 'badge--success',
        tone: 'success',
    },
    waiting_for_customer: {
        label: 'Waiting for customer',
        badgeClass: 'badge--warning',
        tone: 'warning',
    },
    processing: {
        label: 'Processing',
        badgeClass: 'badge--info',
        tone: 'info',
    },
    failed: { label: 'Failed', badgeClass: 'badge--danger', tone: 'danger' },
    stopped: { label: 'Stopped', badgeClass: 'badge--neutral', tone: 'neutral' },
};
