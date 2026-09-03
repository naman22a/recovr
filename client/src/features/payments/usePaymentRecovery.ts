import { useEffect, useState } from 'react';
import { ApiError } from '../../lib/api';
import { fetchPaymentRecovery, type PaymentRecovery } from './payment.api';

export type PaymentRecoveryState =
    | { status: 'loading' }
    | { status: 'not-found' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: PaymentRecovery };

type Resolved = Exclude<PaymentRecoveryState, { status: 'loading' }>;

/**
 * Fetches GET /recovery/payments/:paymentId. Pass `null` for a missing/invalid
 * route param to render the not-found state. Refetches when the id changes
 * (navigating between payments); a stale response never overwrites a newer id.
 * No caching, no deps.
 */
export function usePaymentRecovery(
    paymentId: number | null,
): PaymentRecoveryState {
    const [result, setResult] = useState<{ id: number; state: Resolved } | null>(
        null,
    );

    useEffect(() => {
        if (paymentId === null) return;

        const controller = new AbortController();

        fetchPaymentRecovery(paymentId, controller.signal)
            .then((data) =>
                setResult({
                    id: paymentId,
                    state: { status: 'success', data },
                }),
            )
            .catch((error: unknown) => {
                if (controller.signal.aborted) return;
                if (error instanceof ApiError && error.status === 404) {
                    setResult({ id: paymentId, state: { status: 'not-found' } });
                    return;
                }
                setResult({
                    id: paymentId,
                    state: {
                        status: 'error',
                        message:
                            error instanceof Error
                                ? error.message
                                : 'Failed to load payment recovery.',
                    },
                });
            });

        return () => controller.abort();
    }, [paymentId]);

    if (paymentId === null) return { status: 'not-found' };
    if (result === null || result.id !== paymentId) return { status: 'loading' };
    return result.state;
}
