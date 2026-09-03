import { useState } from 'react';
import {
    STATUS_META,
    STRATEGY_META,
    type RecoveryAttemptStatus,
    type RecoveryStrategy,
} from '../../lib/recovery';
import type { RecoveryAttemptRow } from '../overview/overview.mock';
import type { RecoveryHistoryState } from '../overview/useRecoveryHistory';
import { useRecoveryHistory } from '../overview/useRecoveryHistory';
import DecisionsTable from './DecisionsTable';

const STRATEGY_ORDER: RecoveryStrategy[] = [
    'retry_payment',
    'customer_retry',
    'manual_review',
];
const STATUS_ORDER: RecoveryAttemptStatus[] = [
    'completed',
    'processing',
    'waiting_for_customer',
    'failed',
    'stopped',
    'pending',
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
        String(row.paymentId).includes(q) ||
        row.razorpayPaymentId.toLowerCase().includes(q)
    );
}

export default function AiDecisionsPage() {
    const [history] = useRecoveryHistory();

    const [search, setSearch] = useState('');
    const [strategyFilter, setStrategyFilter] = useState<
        RecoveryStrategy | 'all'
    >('all');
    const [statusFilter, setStatusFilter] = useState<
        RecoveryAttemptStatus | 'all'
    >('all');

    const rows = history.status === 'success' ? history.data : EMPTY;
    const searched = rows.filter((row) => matchesSearch(row, search.trim()));

    function countOf<T>(pick: (row: RecoveryAttemptRow) => T): Map<T, number> {
        const counts = new Map<T, number>();
        for (const row of searched) {
            const key = pick(row);
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        return counts;
    }

    const strategyCounts = countOf((row) => row.strategy);
    const statusCounts = countOf((row) => row.status);

    const strategyOptions: FilterOption<RecoveryStrategy>[] = STRATEGY_ORDER.filter(
        (strategy) => strategyCounts.has(strategy),
    ).map((strategy) => ({
        value: strategy,
        label: STRATEGY_META[strategy].label,
        count: strategyCounts.get(strategy) ?? 0,
    }));

    const statusOptions: FilterOption<RecoveryAttemptStatus>[] = STATUS_ORDER.filter(
        (status) => statusCounts.has(status),
    ).map((status) => ({
        value: status,
        label: STATUS_META[status].label,
        count: statusCounts.get(status) ?? 0,
    }));

    const filtered = searched.filter(
        (row) =>
            (strategyFilter === 'all' || row.strategy === strategyFilter) &&
            (statusFilter === 'all' || row.status === statusFilter),
    );

    const tableHistory: RecoveryHistoryState =
        history.status === 'success'
            ? { status: 'success', data: filtered }
            : history;

    const refined =
        search.trim() !== '' ||
        strategyFilter !== 'all' ||
        statusFilter !== 'all';

    const clearAll = () => {
        setSearch('');
        setStrategyFilter('all');
        setStatusFilter('all');
    };

    const totalDecisions = rows.length;
    const distribution = STRATEGY_ORDER.map((strategy) => {
        const count = rows.filter((row) => row.strategy === strategy).length;
        return {
            strategy,
            label: STRATEGY_META[strategy].label,
            count,
            share: totalDecisions
                ? Math.round((count / totalDecisions) * 100)
                : 0,
        };
    });

    return (
        <div>
            <div className="page-head">
                <h1>AI Recovery Decisions</h1>
                <p>
                    Understand why Recovr recommends each recovery strategy.
                </p>
            </div>

            {history.status === 'success' && totalDecisions > 0 && (
                <div className="section">
                    <div className="section-head">
                        <h2>Strategy distribution</h2>
                        <span
                            className="text-faint"
                            style={{ fontSize: 'var(--text-xs)' }}
                        >
                            {totalDecisions} decisions
                        </span>
                    </div>
                    <div className="card">
                        <div className="ai-dist">
                            {distribution.map((item) => (
                                <div className="ai-dist-row" key={item.strategy}>
                                    <span className="ai-dist-label">
                                        {item.label}
                                    </span>
                                    <span className="ai-dist-track">
                                        <span
                                            className="ai-dist-fill"
                                            data-strategy={item.strategy}
                                            style={{ width: `${item.share}%` }}
                                        />
                                    </span>
                                    <span className="ai-dist-val">
                                        {item.count} &middot; {item.share}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

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
                            placeholder="Search payment ID or Razorpay ID"
                            aria-label="Search AI decisions"
                        />
                    </label>

                    <FilterGroup
                        label="Strategy"
                        options={strategyOptions}
                        value={strategyFilter}
                        onChange={setStrategyFilter}
                    />
                    <FilterGroup
                        label="Status"
                        options={statusOptions}
                        value={statusFilter}
                        onChange={setStatusFilter}
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
                    <h2>Decisions</h2>
                    <span
                        className="text-faint"
                        style={{ fontSize: 'var(--text-xs)' }}
                    >
                        {history.status === 'success'
                            ? refined
                                ? `${filtered.length} of ${rows.length}`
                                : `${rows.length} total`
                            : 'One row per recovery attempt'}
                    </span>
                </div>
                <DecisionsTable
                    history={tableHistory}
                    emptyLabel={
                        refined
                            ? 'No decisions match your search or filters.'
                            : 'No AI decisions recorded yet.'
                    }
                />
            </div>
        </div>
    );
}
