import { formatInrFromPaise } from '../../lib/format';
import {
    recentAttempts,
    type RecoveryAttemptStatus,
    type RecoveryStrategy,
} from './overview.mock';

const STATUS_BADGE: Record<
    RecoveryAttemptStatus,
    { cls: string; label: string }
> = {
    completed: { cls: 'badge--success', label: 'Recovered' },
    waiting_for_customer: { cls: 'badge--warning', label: 'Waiting' },
    processing: { cls: 'badge--info', label: 'Processing' },
    stopped: { cls: 'badge--neutral', label: 'Manual review' },
    failed: { cls: 'badge--danger', label: 'Failed' },
};

const STRATEGY_BADGE: Record<
    RecoveryStrategy,
    { cls: string; label: string }
> = {
    retry_payment: {
        cls: 'badge--strategy strategy--retry',
        label: 'Auto retry',
    },
    customer_retry: {
        cls: 'badge--strategy strategy--customer',
        label: 'Customer retry',
    },
    manual_review: {
        cls: 'badge--strategy strategy--manual',
        label: 'Manual review',
    },
};

const METHOD_LABEL: Record<string, string> = {
    upi: 'UPI',
    card: 'Card',
    netbanking: 'Netbanking',
    wallet: 'Wallet',
};

interface Props {
    onSelect: (attemptId: number) => void;
}

export default function RecentAttemptsTable({ onSelect }: Props) {
    return (
        <div className="table-wrap">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Payment</th>
                        <th className="col-num">Amount</th>
                        <th>Method</th>
                        <th>Error</th>
                        <th>AI Strategy</th>
                        <th>Confidence</th>
                        <th className="col-num">Attempt</th>
                        <th>Status</th>
                        <th className="col-num">Recovered</th>
                    </tr>
                </thead>
                <tbody>
                    {recentAttempts.map((row) => {
                        const status = STATUS_BADGE[row.status];
                        const strategy = STRATEGY_BADGE[row.strategy];
                        const confidence = Math.round(row.confidence * 100);
                        return (
                            <tr
                                key={row.attemptId}
                                className="data-row"
                                tabIndex={0}
                                onClick={() => onSelect(row.attemptId)}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === 'Enter' ||
                                        event.key === ' '
                                    ) {
                                        event.preventDefault();
                                        onSelect(row.attemptId);
                                    }
                                }}
                            >
                                <td className="cell-payment">
                                    <span className="mono">
                                        {row.razorpayPaymentId}
                                    </span>
                                </td>
                                <td className="cell-num">
                                    {formatInrFromPaise(row.amount)}
                                </td>
                                <td className="cell-method">
                                    {METHOD_LABEL[row.method] ??
                                        row.method.toUpperCase()}
                                </td>
                                <td className="cell-error">
                                    <span
                                        title={row.errorDescription ?? undefined}
                                    >
                                        {row.errorDescription ?? '—'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${strategy.cls}`}>
                                        {strategy.label}
                                    </span>
                                </td>
                                <td>
                                    <span className="conf">
                                        <span className="conf-track">
                                            <span
                                                className="conf-fill"
                                                style={{
                                                    width: `${confidence}%`,
                                                }}
                                            />
                                        </span>
                                        <span className="conf-val">
                                            {confidence}%
                                        </span>
                                    </span>
                                </td>
                                <td className="cell-num">
                                    {row.attemptNumber}/{row.maxAttempts}
                                </td>
                                <td>
                                    <span className={`badge ${status.cls}`}>
                                        {status.label}
                                    </span>
                                </td>
                                <td className="cell-num">
                                    {row.amountRecovered > 0 ? (
                                        formatInrFromPaise(row.amountRecovered)
                                    ) : (
                                        <span className="text-faint">&mdash;</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
