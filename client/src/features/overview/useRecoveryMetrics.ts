import { useCallback, useEffect, useState } from 'react';
import { fetchRecoveryMetrics } from './overview.api';
import type { RecoveryMetrics } from './overview.mock';

export type RecoveryMetricsState =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: RecoveryMetrics };

/**
 * Fetches GET /recovery/metrics on mount. Returns the state plus a `refetch`
 * that re-runs the request in place (keeping the current data visible).
 */
export function useRecoveryMetrics(): [RecoveryMetricsState, () => void] {
    const [state, setState] = useState<RecoveryMetricsState>({
        status: 'loading',
    });
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        fetchRecoveryMetrics(controller.signal)
            .then((data) => setState({ status: 'success', data }))
            .catch((error: unknown) => {
                if (controller.signal.aborted) return;
                setState({
                    status: 'error',
                    message:
                        error instanceof Error
                            ? error.message
                            : 'Failed to load recovery metrics.',
                });
            });

        return () => controller.abort();
    }, [reloadKey]);

    const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

    return [state, refetch];
}
