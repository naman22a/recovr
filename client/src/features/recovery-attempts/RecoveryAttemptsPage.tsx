import { useState } from 'react';
import { formatMethod } from '../../lib/format';
import {
    STATUS_META,
    STRATEGY_META,
    type RecoveryAttemptStatus,
    type RecoveryStrategy,
} from '../../lib/recovery';
import type { RecoveryAttemptRow } from '../overview/overview.mock';
import type { RecoveryHistoryState } from '../overview/useRecoveryHistory';
import { useRecoveryHistory } from '../overview/useRecoveryHistory';
import AttemptsTable from './AttemptsTable';

const STATUS_ORDER: RecoveryAttemptStatus[] = [
    'completed',
    'processing',
    'waiting_for_customer',
    'failed',
    'stopped',
    'pending',
];
const STRATEGY_ORDER: RecoveryStrategy[] = [
    'retry_payment',
    'customer_retry',
    'manual_review',
];

const EMPTY: RecoveryAttemptRow[] = [];

interface FilterOption<T extends string> {
    value: T;
    label: string;
    count: number;
}

function FilterGroup<T extends string>({
    label,
    options,
    value,
    onChange,
}: {
    label: string;
    options: FilterOption<T>[];
    value: T | 'all';
    onChange: (next: T | 'all') => void;
}) {
    const total = options.reduce((sum, option) => sum + option.count, 0);
    return (
        <div className="filter-group">
            <span className="filter-label">{label}</span>
            <button
                type="button"
                className="filter-chip"
                data-active={value === 'all'}
                onClick={() => onChange('all')}
            >
                All
                <span className="filter-count">{total}</span>
            </button>
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    className="filter-chip"
                    data-active={value === option.value}
                    onClick={() => onChange(option.value)}
                >
                    {option.label}
                    <span className="filter-count">{option.count}</span>
                </button>
            ))}
        </div>
    );
}

function matchesSearch(row: RecoveryAttemptRow, query: string): boolean {
    if (!query) return true;
    const q = query.replace(/^#/, '').toLowerCase();
    return (
        row.razorpayPaymentId.toLowerCase().includes(q) ||
        String(row.paymentId).includes(q) ||
        String(row.attemptId).includes(q)
    );
}

export default function RecoveryAttemptsPage() {
    const [history] = useRecoveryHistory();

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<
        RecoveryAttemptStatus | 'all'
    >('all');
    const [strategyFilter, setStrategyFilter] = useState<
        RecoveryStrategy | 'all'
    >('all');
    const [methodFilter, setMethodFilter] = useState<string>('all');

    const rows = history.status === 'success' ? history.data : EMPTY;
    const searchedRows = rows.filter((row) =>
        matchesSearch(row, search.trim()),
    );

    function countOf<T>(pick: (row: RecoveryAttemptRow) => T): Map<T, number> {
        const counts = new Map<T, number>();
        for (const row of searchedRows) {
            const key = pick(row);
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        return counts;
    }

    const statusCounts = countOf((row) => row.status);
    const strategyCounts = countOf((row) => row.strategy);
    const methodCounts = countOf((row) => row.method ?? '');

    const statusOptions: FilterOption<RecoveryAttemptStatus>[] = STATUS_ORDER.filter(
        (status) => statusCounts.has(status),
    ).map((status) => ({
        value: status,
        label: STATUS_META[status].label,
        count: statusCounts.get(status) ?? 0,
    }));

    const strategyOptions: FilterOption<RecoveryStrategy>[] = STRATEGY_ORDER.filter(
        (strategy) => strategyCounts.has(strategy),
    ).map((strategy) => ({
        value: strategy,
        label: STRATEGY_META[strategy].label,
        count: strategyCounts.get(strategy) ?? 0,
    }));

    const methodOptions: FilterOption<string>[] = [...methodCounts.keys()]
        .filter((method) => method !== '')
        .sort()
        .map((method) => ({
            value: method,
            label: formatMethod(method),
            count: methodCounts.get(method) ?? 0,
        }));

    const filteredRows = searchedRows.filter(
        (row) =>
            (statusFilter === 'all' || row.status === statusFilter) &&
            (strategyFilter === 'all' || row.strategy === strategyFilter) &&
            (methodFilter === 'all' || row.method === methodFilter),
    );

    const filteredHistory: RecoveryHistoryState =
        history.status === 'success'
            ? { status: 'success', data: filteredRows }
            : history;

    const refined =
        search.trim() !== '' ||
        statusFilter !== 'all' ||
        strategyFilter !== 'all' ||
        methodFilter !== 'all';

    const clearAll = () => {
        setSearch('');
        setStatusFilter('all');
        setStrategyFilter('all');
        setMethodFilter('all');
    };

    return (
        <div>
            <div className="page-head">
                <h1>Recovery Attempts</h1>
                <p>
                    Track every AI-driven recovery decision and its execution
                    outcome.
                </p>
            </div>

            {history.status === 'success' && rows.length > 0 && (
                <div className="attempts-toolbar">
                    <label className="search">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            aria-hidden="true"
                        >
                            <circle cx="11" cy="11" r="7" />
                            <path d="m20 20-3.6-3.6" />
                        </svg>
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search payment ID, Razorpay ID, attempt ID"
                            aria-label="Search recovery attempts"
                        />
                    </label>

                    <FilterGroup
                        label="Status"
                        options={statusOptions}
                        value={statusFilter}
                        onChange={setStatusFilter}
                    />
                    <FilterGroup
                        label="Strategy"
                        options={strategyOptions}
                        value={strategyFilter}
                        onChange={setStrategyFilter}
                    />
                    <FilterGroup
                        label="Method"
                        options={methodOptions}
                        value={methodFilter}
                        onChange={setMethodFilter}
                    />

                    {refined && (
                        <button
                            type="button"
                            className="btn btn--ghost btn--sm"
                            onClick={clearAll}
                        >
                            Clear
                        </button>
                    )}
                </div>
            )}

            <div className="section">
                <div className="section-head">
                    <h2>All attempts</h2>
                    <span
                        className="text-faint"
                        style={{ fontSize: 'var(--text-xs)' }}
                    >
                        {history.status === 'success'
                            ? refined
                                ? `${filteredRows.length} of ${rows.length}`
                                : `${rows.length} total`
                            : 'Newest first'}
                    </span>
                </div>
                <AttemptsTable
                    history={filteredHistory}
                    emptyLabel={
                        refined
                            ? 'No attempts match your search or filters.'
                            : 'No recovery attempts yet.'
                    }
                />
            </div>
        </div>
    );
}
