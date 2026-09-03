import { useCallback, useEffect, useState } from 'react';
import { fetchRecoveryHistory } from './overview.api';
import type { RecoveryAttemptRow } from './overview.mock';

export type RecoveryHistoryState =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; data: RecoveryAttemptRow[] };

/**
 * Fetches GET /recovery/history on mount. Returns the state plus a `refetch`
 * that re-runs the request in place (keeping the current rows visible).
 */
export function useRecoveryHistory(): [RecoveryHistoryState, () => void] {
    const [state, setState] = useState<RecoveryHistoryState>({
        status: 'loading',
    });
    const [reloadKey, setReloadKey] = useState(0);

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
    }, [reloadKey]);

    const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

    return [state, refetch];
}
