import { apiGet } from '../../lib/api';
import type { RecoveryMetrics } from './overview.mock';

/** GET /recovery/metrics */
export function fetchRecoveryMetrics(
    signal?: AbortSignal,
): Promise<RecoveryMetrics> {
    return apiGet<RecoveryMetrics>('/recovery/metrics', signal);
}
