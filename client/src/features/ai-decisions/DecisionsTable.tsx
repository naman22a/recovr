import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatTimestamp } from '../../lib/format';
import { STATUS_META, STRATEGY_META } from '../../lib/recovery';
import type { RecoveryAttemptRow } from '../overview/overview.mock';
import type { RecoveryHistoryState } from '../overview/useRecoveryHistory';

const COLUMN_COUNT = 8;
const REASON_CLAMP_AT = 90;

function DecisionRow({
    row,
    onOpen,
}: {
    row: RecoveryAttemptRow;
    onOpen: (paymentId: number) => void;
}) {
    const [expanded, setExpanded] = useState(false);

    const status = STATUS_META[row.status];
    const strategy = STRATEGY_META[row.strategy];
    const confidencePct =
        row.confidence == null ? null : Math.round(row.confidence * 100);
    const reason = row.reason ?? '';
    const longReason = reason.length > REASON_CLAMP_AT;
    const open = () => onOpen(row.paymentId);

    return (
        <tr
            className="data-row"
            tabIndex={0}
            onClick={open}
            onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return;
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    open();
                }
            }}
        >
            <td className="cell-payment">
                <span className="cell-id mono">{row.razorpayPaymentId}</span>
                <span className="cell-sub">Payment {row.paymentId}</span>
            </td>
            <td className="cell-num">
                {row.attemptNumber}/{row.maxAttempts}
            </td>
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
                            style={{ width: `${confidencePct ?? 0}%` }}
                        />
                    </span>
                    <span className="conf-val">
                        {confidencePct == null ? '—' : `${confidencePct}%`}
                    </span>
                </span>
            </td>
            <td className="cell-method">AI</td>
            <td className="cell-reason">
                {reason ? (
                    <>
                        <span
                            className={
                                expanded ? 'reason' : 'reason reason--clamp'
                            }
                            title={
                                longReason && !expanded ? reason : undefined
                            }
                        >
                            {reason}
                        </span>
                        {longReason && (
                            <button
                                type="button"
                                className="reason-toggle"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setExpanded((value) => !value);
                                }}
                            >
                                {expanded ? 'Show less' : 'Show full reason'}
                            </button>
                        )}
                    </>
                ) : (
                    <span className="text-faint">—</span>
                )}
            </td>
            <td>
                <span className={`badge ${status.badgeClass}`}>
                    {status.label}
                </span>
            </td>
            <td className="cell-time">{formatTimestamp(row.createdAt)}</td>
        </tr>
    );
}

interface Props {
    history: RecoveryHistoryState;
    emptyLabel: string;
}

export default function DecisionsTable({ history, emptyLabel }: Props) {
    const navigate = useNavigate();
    const openPayment = (paymentId: number) =>
        navigate(`/payments/${paymentId}`);

    return (
        <div className="table-wrap">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Payment</th>
                        <th className="col-num">Attempt</th>
                        <th>Strategy</th>
                        <th>Confidence</th>
                        <th>Decision Source</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Created</th>
                    </tr>
                </thead>
                <tbody>
                    {history.status === 'loading' && (
                        <tr>
                            <td className="table-note" colSpan={COLUMN_COUNT}>
                                Loading AI decisions&hellip;
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
                            <DecisionRow
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
