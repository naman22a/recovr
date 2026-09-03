import { useState } from 'react';
import { formatMethod } from '../../lib/format';
import {
    STATUS_META,
    type RecoveryAttemptStatus,
} from '../../lib/recovery';
import { useRecoveryHistory } from '../overview/useRecoveryHistory';
import {
    derivePaymentRows,
    type PaymentRow,
    type PaymentsListState,
} from './paymentsList';
import PaymentsTable from './PaymentsTable';

const STATUS_ORDER: RecoveryAttemptStatus[] = [
    'completed',
    'processing',
    'waiting_for_customer',
    'failed',
    'stopped',
    'pending',
];

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

function matchesSearch(payment: PaymentRow, query: string): boolean {
    if (!query) return true;
    const q = query.replace(/^#/, '').toLowerCase();
    return (
        String(payment.paymentId).includes(q) ||
        payment.razorpayPaymentId.toLowerCase().includes(q)
    );
}

export default function PaymentsPage() {
    const [history] = useRecoveryHistory();

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<
        RecoveryAttemptStatus | 'all'
    >('all');
    const [methodFilter, setMethodFilter] = useState<string>('all');

    const payments =
        history.status === 'success' ? derivePaymentRows(history.data) : [];
    const searched = payments.filter((payment) =>
        matchesSearch(payment, search.trim()),
    );

    function countOf<T>(pick: (payment: PaymentRow) => T): Map<T, number> {
        const counts = new Map<T, number>();
        for (const payment of searched) {
            const key = pick(payment);
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }
        return counts;
    }

    const statusCounts = countOf((payment) => payment.recoveryStatus);
    const methodCounts = countOf((payment) => payment.method ?? '');

    const statusOptions: FilterOption<RecoveryAttemptStatus>[] = STATUS_ORDER.filter(
        (status) => statusCounts.has(status),
    ).map((status) => ({
        value: status,
        label: STATUS_META[status].label,
        count: statusCounts.get(status) ?? 0,
    }));

    const methodOptions: FilterOption<string>[] = [...methodCounts.keys()]
        .filter((method) => method !== '')
        .sort()
        .map((method) => ({
            value: method,
            label: formatMethod(method),
            count: methodCounts.get(method) ?? 0,
        }));

    const filtered = searched.filter(
        (payment) =>
            (statusFilter === 'all' ||
                payment.recoveryStatus === statusFilter) &&
            (methodFilter === 'all' || payment.method === methodFilter),
    );

    const tableState: PaymentsListState =
        history.status === 'loading'
            ? { status: 'loading' }
            : history.status === 'error'
              ? { status: 'error', message: history.message }
              : { status: 'success', data: filtered };

    const refined =
        search.trim() !== '' ||
        statusFilter !== 'all' ||
        methodFilter !== 'all';

    const clearAll = () => {
        setSearch('');
        setStatusFilter('all');
        setMethodFilter('all');
    };

    return (
        <div>
            <div className="page-head">
                <h1>Payments</h1>
                <p>
                    Failed payments and their recovery outcome, grouped from
                    every recorded recovery attempt.
                </p>
            </div>

            {history.status === 'success' && payments.length > 0 && (
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
                            aria-label="Search payments"
                        />
                    </label>

                    <FilterGroup
                        label="Status"
                        options={statusOptions}
                        value={statusFilter}
                        onChange={setStatusFilter}
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
                    <h2>All payments</h2>
                    <span
                        className="text-faint"
                        style={{ fontSize: 'var(--text-xs)' }}
                    >
                        {history.status === 'success'
                            ? refined
                                ? `${filtered.length} of ${payments.length}`
                                : `${payments.length} total`
                            : 'From recovery history'}
                    </span>
                </div>
                <PaymentsTable
                    state={tableState}
                    emptyLabel={
                        refined
                            ? 'No payments match your search or filters.'
                            : 'No payments found.'
                    }
                />
            </div>
        </div>
    );
}
