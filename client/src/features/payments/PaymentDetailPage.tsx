import { Fragment, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    formatInrFromPaise,
    formatMethod,
    formatTimestamp,
} from '../../lib/format';
import { STATUS_META, STRATEGY_META } from '../../lib/recovery';
import { usePaymentRecovery } from './usePaymentRecovery';

const PAYMENT_STATUS: Record<string, { label: string; badgeClass: string }> = {
    failed: { label: 'Failed', badgeClass: 'badge--danger' },
    captured: { label: 'Captured', badgeClass: 'badge--success' },
    authorized: { label: 'Authorized', badgeClass: 'badge--info' },
    refunded: { label: 'Refunded', badgeClass: 'badge--neutral' },
};

function confidenceText(value: number | null): string {
    return value === null ? '—' : `${Math.round(value * 100)}%`;
}

function Notice({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div>
            <Link to="/" className="backlink">
                &larr; Overview
            </Link>
            <div className="page-head">
                <h1>{title}</h1>
                <p className="text-muted">{children}</p>
            </div>
        </div>
    );
}

export default function PaymentDetailPage() {
    const { paymentId } = useParams();
    const numericId =
        paymentId !== undefined && /^\d+$/.test(paymentId)
            ? Number(paymentId)
            : null;
    const state = usePaymentRecovery(numericId);

    if (state.status === 'loading') {
        return (
            <Notice title="Payment recovery">
                Loading payment recovery&hellip;
            </Notice>
        );
    }

    if (state.status === 'not-found') {
        return (
            <Notice title="Payment not found">
                No recovery record exists for payment{' '}
                <span className="mono">#{paymentId}</span>.
            </Notice>
        );
    }

    if (state.status === 'error') {
        return <Notice title="Payment recovery">{state.message}</Notice>;
    }

    const { payment, recoveryAttempts } = state.data;
    const decision = recoveryAttempts.at(-1);
    const paymentStatus = PAYMENT_STATUS[payment.status] ?? {
        label: payment.status,
        badgeClass: 'badge--neutral',
    };

    return (
        <div>
            <Link to="/" className="backlink">
                &larr; Overview
            </Link>

            <div className="page-head">
                <h1>Payment recovery</h1>
                <p className="text-muted">
                    <span className="mono">{payment.razorpayPaymentId}</span>
                    {'  ·  '}
                    {formatInrFromPaise(payment.amount)} {payment.currency}
                    {'  ·  '}
                    {formatMethod(payment.method)}
                </p>
            </div>

            <div className="detail-cols">
                {/* 1. Payment summary */}
                <div className="panel">
                    <p className="panel-title">Payment summary</p>
                    <div className="kv">
                        <span className="kv-key">Razorpay Payment ID</span>
                        <span className="kv-val mono">
                            {payment.razorpayPaymentId}
                        </span>

                        <span className="kv-key">Amount</span>
                        <span className="kv-val mono">
                            {formatInrFromPaise(payment.amount)}
                        </span>

                        <span className="kv-key">Currency</span>
                        <span className="kv-val">{payment.currency}</span>

                        <span className="kv-key">Method</span>
                        <span className="kv-val">
                            {formatMethod(payment.method)}
                        </span>

                        <span className="kv-key">Payment status</span>
                        <span className="kv-val">
                            <span className={`badge ${paymentStatus.badgeClass}`}>
                                {paymentStatus.label}
                            </span>
                        </span>

                        <span className="kv-key">Error code</span>
                        <span className="kv-val mono">
                            {payment.errorCode ?? '—'}
                        </span>

                        <span className="kv-key">Error description</span>
                        <span className="kv-val">
                            {payment.errorDescription ?? '—'}
                        </span>
                    </div>
                </div>

                {/* 2. AI Recovery Decision */}
                <div className="panel">
                    <p className="panel-title">
                        AI Recovery Decision &middot; latest
                    </p>
                    {decision ? (
                        <>
                            {decision.reason && (
                                <p className="decision-reason">
                                    {decision.reason}
                                </p>
                            )}
                            <div className="decision-stats">
                                <div className="decision-stat">
                                    <span className="decision-stat-key">
                                        Strategy
                                    </span>
                                    <span className="decision-stat-val">
                                        <span
                                            className={`badge ${STRATEGY_META[decision.strategy].badgeClass}`}
                                        >
                                            {
                                                STRATEGY_META[decision.strategy]
                                                    .label
                                            }
                                        </span>
                                    </span>
                                </div>
                                <div className="decision-stat">
                                    <span className="decision-stat-key">
                                        Confidence
                                    </span>
                                    <span className="decision-stat-val mono">
                                        {confidenceText(decision.confidence)}
                                    </span>
                                </div>
                                <div className="decision-stat">
                                    <span className="decision-stat-key">
                                        Decision source
                                    </span>
                                    <span className="decision-stat-val">
                                        {decision.decisionSource.toUpperCase()}
                                    </span>
                                </div>
                                <div className="decision-stat">
                                    <span className="decision-stat-key">
                                        Attempt number
                                    </span>
                                    <span className="decision-stat-val mono">
                                        {decision.attemptNumber}
                                    </span>
                                </div>
                                <div className="decision-stat">
                                    <span className="decision-stat-key">
                                        Maximum attempts
                                    </span>
                                    <span className="decision-stat-val mono">
                                        {decision.maxAttempts}
                                    </span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p
                            className="text-muted"
                            style={{ fontSize: 'var(--text-sm)' }}
                        >
                            No recovery attempt has been recorded for this
                            payment yet.
                        </p>
                    )}
                </div>
            </div>

            {/* 3. Recovery timeline */}
            <section className="section">
                <div className="section-head">
                    <h2>Recovery timeline</h2>
                    <span
                        className="text-faint"
                        style={{ fontSize: 'var(--text-xs)' }}
                    >
                        {recoveryAttempts.length} attempts
                        {decision && ` · limit ${decision.maxAttempts}`}
                    </span>
                </div>

                <div className="callout">
                    Recovr re-evaluates failed recovery attempts and stops when
                    the configured attempt limit is reached.
                </div>

                {recoveryAttempts.length === 0 ? (
                    <p className="attempt-detail">
                        No recovery attempts have run for this payment yet.
                    </p>
                ) : (
                    <ol className="timeline">
                        {recoveryAttempts.map((attempt, index) => {
                            const status = STATUS_META[attempt.status];
                            const strategy = STRATEGY_META[attempt.strategy];
                            return (
                                <Fragment key={attempt.id}>
                                    {index > 0 && (
                                        <li className="timeline-item timeline-item--reeval">
                                            <span className="timeline-dot timeline-dot--reeval" />
                                            <div>
                                                <div className="reeval-label">
                                                    AI re-evaluation
                                                </div>
                                                <div className="reeval-text">
                                                    New recommendation:{' '}
                                                    {strategy.label}
                                                    {attempt.confidence !==
                                                        null &&
                                                        ` · ${Math.round(
                                                            attempt.confidence *
                                                                100,
                                                        )}% confidence`}
                                                </div>
                                            </div>
                                        </li>
                                    )}
                                    <li className="timeline-item">
                                        <span
                                            className={`timeline-dot timeline-dot--${status.tone}`}
                                        />
                                        <div className="attempt">
                                            <div className="attempt-head">
                                                <span className="attempt-n">
                                                    Attempt{' '}
                                                    {attempt.attemptNumber} of{' '}
                                                    {attempt.maxAttempts}
                                                </span>
                                                <span
                                                    className={`badge ${strategy.badgeClass}`}
                                                >
                                                    {strategy.label}
                                                </span>
                                                <span
                                                    className={`badge ${status.badgeClass}`}
                                                >
                                                    {status.label}
                                                </span>
                                                <span className="attempt-time">
                                                    {formatTimestamp(
                                                        attempt.createdAt,
                                                    )}
                                                </span>
                                            </div>
                                            {attempt.reason && (
                                                <p className="attempt-detail">
                                                    {attempt.reason}
                                                </p>
                                            )}
                                            {(attempt.failureReason ??
                                                attempt.result) && (
                                                <p className="attempt-detail">
                                                    <span className="mono">
                                                        {attempt.failureReason ??
                                                            attempt.result}
                                                    </span>
                                                </p>
                                            )}
                                            {attempt.amountRecovered > 0 && (
                                                <p className="attempt-detail">
                                                    Recovered{' '}
                                                    <span className="mono">
                                                        {formatInrFromPaise(
                                                            attempt.amountRecovered,
                                                        )}
                                                    </span>
                                                </p>
                                            )}
                                        </div>
                                    </li>
                                </Fragment>
                            );
                        })}
                    </ol>
                )}
            </section>
        </div>
    );
}
