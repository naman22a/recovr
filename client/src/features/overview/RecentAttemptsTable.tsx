import { useNavigate } from 'react-router-dom';
import { formatInrFromPaise, formatMethod } from '../../lib/format';
import { STATUS_META, STRATEGY_META } from '../../lib/recovery';
import { recentAttempts } from './overview.mock';

export default function RecentAttemptsTable() {
    const navigate = useNavigate();

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
                        const status = STATUS_META[row.status];
                        const strategy = STRATEGY_META[row.strategy];
                        const confidence = Math.round(row.confidence * 100);
                        const open = () =>
                            navigate(`/payments/${row.paymentId}`);
                        return (
                            <tr
                                key={row.attemptId}
                                className="data-row"
                                tabIndex={0}
                                onClick={open}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === 'Enter' ||
                                        event.key === ' '
                                    ) {
                                        event.preventDefault();
                                        open();
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
                                    {formatMethod(row.method)}
                                </td>
                                <td className="cell-error">
                                    <span
                                        title={row.errorDescription ?? undefined}
                                    >
                                        {row.errorDescription ?? '—'}
                                    </span>
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
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
