import { useNavigate } from 'react-router-dom';
import { formatInrFromPaise, formatMethod } from '../../lib/format';
import { STATUS_META } from '../../lib/recovery';
import type { PaymentRow, PaymentsListState } from './paymentsList';

const COLUMN_COUNT = 10;

function Row({
    payment,
    onOpen,
}: {
    payment: PaymentRow;
    onOpen: (paymentId: number) => void;
}) {
    const status = STATUS_META[payment.recoveryStatus];
    const open = () => onOpen(payment.paymentId);

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
            <td className="cell-num">#{payment.paymentId}</td>
            <td className="cell-payment">
                <span className="mono">{payment.razorpayPaymentId}</span>
            </td>
            <td className="cell-num">{formatInrFromPaise(payment.amount)}</td>
            <td className="cell-method">{payment.currency}</td>
            <td className="cell-method">{formatMethod(payment.method)}</td>
            <td className="cell-method mono">{payment.errorCode ?? '—'}</td>
            <td className="cell-error">
                <span title={payment.errorDescription ?? undefined}>
                    {payment.errorDescription ?? '—'}
                </span>
            </td>
            <td className="cell-num">{payment.attemptCount}</td>
            <td>
                <span className={`badge ${status.badgeClass}`}>
                    {status.label}
                </span>
            </td>
            <td className="cell-num">
                {payment.amountRecovered > 0 ? (
                    formatInrFromPaise(payment.amountRecovered)
                ) : (
                    <span className="text-faint">&mdash;</span>
                )}
            </td>
        </tr>
    );
}

interface Props {
    state: PaymentsListState;
    emptyLabel: string;
}

export default function PaymentsTable({ state, emptyLabel }: Props) {
    const navigate = useNavigate();
    const openPayment = (paymentId: number) =>
        navigate(`/payments/${paymentId}`);

    return (
        <div className="table-wrap">
            <table className="data-table">
                <thead>
                    <tr>
                        <th className="col-num">Payment ID</th>
                        <th>Razorpay Payment ID</th>
                        <th className="col-num">Amount</th>
                        <th>Currency</th>
                        <th>Method</th>
                        <th>Error Code</th>
                        <th>Error Description</th>
                        <th className="col-num">Attempts</th>
                        <th>Status</th>
                        <th className="col-num">Recovered</th>
                    </tr>
                </thead>
                <tbody>
                    {state.status === 'loading' && (
                        <tr>
                            <td className="table-note" colSpan={COLUMN_COUNT}>
                                Loading payments&hellip;
                            </td>
                        </tr>
                    )}

                    {state.status === 'error' && (
                        <tr>
                            <td className="table-note" colSpan={COLUMN_COUNT}>
                                {state.message}
                            </td>
                        </tr>
                    )}

                    {state.status === 'success' &&
                        state.data.length === 0 && (
                            <tr>
                                <td
                                    className="table-note"
                                    colSpan={COLUMN_COUNT}
                                >
                                    {emptyLabel}
                                </td>
                            </tr>
                        )}

                    {state.status === 'success' &&
                        state.data.map((payment) => (
                            <Row
                                key={payment.paymentId}
                                payment={payment}
                                onOpen={openPayment}
                            />
                        ))}
                </tbody>
            </table>
        </div>
    );
}
