import { useEffect, useState } from 'react';
import { fetchRecoveryHistory } from './overview.api';
import type { RecoveryAttemptRow } from './overview.mock';

export type RecoveryHistoryState =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: RecoveryAttemptRow[] };

/** Fetches GET /recovery/history once on mount. No caching, no deps. */
export function useRecoveryHistory(): RecoveryHistoryState {
    const [state, setState] = useState<RecoveryHistoryState>({
        status: 'loading',
    });

    useEffect(() => {
        const controller = new AbortController();

        fetchRecoveryHistory(controller.signal)
            .then((data) => setState({ status: 'success', data }))
            .catch((error: unknown) => {
                if (controller.signal.aborted) return;
                setState({
                    status: 'error',
                    message:
                        error instanceof Error
                            ? error.message
                            : 'Failed to load recovery attempts.',
                });
            });

        return () => controller.abort();
    }, []);

    return state;
}
