/* Minimal fetch helper for the Recovr API. No client library, no cache, no deps. */

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
).replace(/\/+$/, '');

/** Thrown for a non-2xx response; carries the HTTP status so callers can branch (e.g. 404). */
export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
    let response: Response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            headers: { Accept: 'application/json' },
            signal,
        });
    } catch {
        throw new Error('Unable to reach the Recovr API.');
    }

    if (!response.ok) {
        throw new ApiError(
            response.status,
            `Recovr API request failed (${response.status}).`,
        );
    }

    return (await response.json()) as T;
}

export async function apiPost<T>(
    path: string,
    body: unknown,
    signal?: AbortSignal,
): Promise<T> {
    let response: Response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(body),
            signal,
        });
    } catch {
        throw new Error('Unable to reach the Recovr API.');
    }

    if (!response.ok) {
        throw new ApiError(
            response.status,
            `Recovr API request failed (${response.status}).`,
        );
    }

    return (await response.json()) as T;
}
