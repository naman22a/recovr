import { useNavigate } from 'react-router-dom';
import {
    formatInrFromPaise,
    formatMethod,
    formatTimestamp,
} from '../../lib/format';
import { STATUS_META, STRATEGY_META } from '../../lib/recovery';
import type { RecoveryAttemptRow } from '../overview/overview.mock';
import type { RecoveryHistoryState } from '../overview/useRecoveryHistory';

const COLUMN_COUNT = 9;

function AttemptRow({
    row,
    onOpen,
}: {
    row: RecoveryAttemptRow;
    onOpen: (paymentId: number) => void;
}) {
    const status = STATUS_META[row.status];
    const strategy = STRATEGY_META[row.strategy];
    const confidence =
        row.confidence == null ? null : Math.round(row.confidence * 100);
    const open = () => onOpen(row.paymentId);

    return (
        <tr
            className="data-row"
            tabIndex={0}
            onClick={open}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    open();
                }
            }}
        >
            <td className="cell-payment">
                <span className="cell-id mono">{row.razorpayPaymentId}</span>
                <span className="cell-sub">
                    Payment {row.paymentId} &middot; Attempt {row.attemptId}
                </span>
            </td>
            <td className="cell-num">{formatInrFromPaise(row.amount)}</td>
            <td className="cell-method">{formatMethod(row.method)}</td>
            <td>
                <span className={`badge ${strategy.badgeClass}`}>
                    {strategy.label}
                </span>
            </td>
            <td>
                <span className="conf">
                    <span className="conf-track">
                        <span
                            className="conf-fill"
                            style={{ width: `${confidence ?? 0}%` }}
                        />
                    </span>
                    <span className="conf-val">
                        {confidence == null ? '—' : `${confidence}%`}
                    </span>
                </span>
            </td>
            <td className="cell-num">
                {row.attemptNumber}/{row.maxAttempts}
            </td>
            <td>
                <span className={`badge ${status.badgeClass}`}>
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
            <td className="cell-time">{formatTimestamp(row.createdAt)}</td>
        </tr>
    );
}

interface Props {
    history: RecoveryHistoryState;
    emptyLabel: string;
}

export default function AttemptsTable({ history, emptyLabel }: Props) {
    const navigate = useNavigate();
    const openPayment = (paymentId: number) =>
        navigate(`/payments/${paymentId}`);

    return (
        <div className="table-wrap">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Payment</th>
                        <th className="col-num">Amount</th>
                        <th>Method</th>
                        <th>Strategy</th>
                        <th>Confidence</th>
                        <th className="col-num">Attempt</th>
                        <th>Status</th>
                        <th className="col-num">Amount Recovered</th>
                        <th>Created</th>
                    </tr>
                </thead>
                <tbody>
                    {history.status === 'loading' && (
                        <tr>
                            <td className="table-note" colSpan={COLUMN_COUNT}>
                                Loading recovery attempts&hellip;
                            </td>
                        </tr>
                    )}

                    {history.status === 'error' && (
                        <tr>
                            <td className="table-note" colSpan={COLUMN_COUNT}>
                                {history.message}
                            </td>
                        </tr>
                    )}

                    {history.status === 'success' &&
                        history.data.length === 0 && (
                            <tr>
                                <td
                                    className="table-note"
                                    colSpan={COLUMN_COUNT}
                                >
                                    {emptyLabel}
                                </td>
                            </tr>
                        )}

                    {history.status === 'success' &&
                        history.data.map((row) => (
                            <AttemptRow
                                key={row.attemptId}
                                row={row}
                                onOpen={openPayment}
                            />
                        ))}
                </tbody>
            </table>
        </div>
    );
}
