import { useEffect, useState } from 'react';
import { fetchRecoveryMetrics } from './overview.api';
import type { RecoveryMetrics } from './overview.mock';

export type RecoveryMetricsState =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: RecoveryMetrics };

/** Fetches GET /recovery/metrics once on mount. No caching, no deps. */
export function useRecoveryMetrics(): RecoveryMetricsState {
    const [state, setState] = useState<RecoveryMetricsState>({
        status: 'loading',
    });

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
    }, []);

    return state;
}
