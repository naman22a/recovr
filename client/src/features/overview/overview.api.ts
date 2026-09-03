import { apiGet } from '../../lib/api';
import type { RecoveryAttemptRow, RecoveryMetrics } from './overview.mock';

/** GET /recovery/metrics */
export function fetchRecoveryMetrics(
    signal?: AbortSignal,
): Promise<RecoveryMetrics> {
    return apiGet<RecoveryMetrics>('/recovery/metrics', signal);
}

/** GET /recovery/history — recovery attempts, newest first. */
export function fetchRecoveryHistory(
    signal?: AbortSignal,
): Promise<RecoveryAttemptRow[]> {
    return apiGet<RecoveryAttemptRow[]>('/recovery/history', signal);
}
