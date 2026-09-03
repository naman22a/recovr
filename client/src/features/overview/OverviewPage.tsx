import {
    formatCount,
    formatInrFromPaise,
    formatPercent,
    formatTimestamp,
} from '../../lib/format';
import {
    overviewMetrics,
    recentActivity,
    type RecoveryActivityStatus,
    type RecoveryStrategy,
} from './overview.mock';

const m = overviewMetrics;

/* Recovery rate = successful recoveries / total failed payments.
   40% of 4 successes implies 10 failed payments (6 still at risk + 4 recovered). */
const totalFailedPayments = m.paymentsAtRisk + m.successfulRecoveries;

const kpis: { label: string; value: string; hint: string }[] = [
    {
        label: 'Payments At Risk',
        value: formatCount(m.paymentsAtRisk),
        hint: `${formatInrFromPaise(m.totalAmountAtRisk)} still exposed`,
    },
    {
        label: 'Amount At Risk',
        value: formatInrFromPaise(m.totalAmountAtRisk),
        hint: `Across ${formatCount(m.paymentsAtRisk)} failed payments`,
    },
    {
        label: 'Successful Recoveries',
        value: formatCount(m.successfulRecoveries),
        hint: `${formatCount(m.totalRecoveryAttempts)} attempts run`,
    },
    {
        label: 'Recovery Rate',
        value: formatPercent(m.recoveryRate),
        hint: `${formatCount(m.successfulRecoveries)} of ${formatCount(totalFailedPayments)} payments`,
    },
    {
        label: 'Amount Recovered',
        value: formatInrFromPaise(m.amountRecovered),
        hint: `${formatPercent(m.recoveryRate)} of exposed value`,
    },
    {
        label: 'Waiting for Customer',
        value: formatCount(m.waitingForCustomer),
        hint: 'Pending customer action',
    },
];

type OutcomeKey = 'success' | 'warning' | 'danger' | 'neutral';

const outcomes: { key: OutcomeKey; label: string; value: number }[] = [
    { key: 'success', label: 'Recovered', value: m.successfulRecoveries },
    { key: 'warning', label: 'Waiting for Customer', value: m.waitingForCustomer },
    { key: 'danger', label: 'Failed', value: m.failedRecoveries },
    { key: 'neutral', label: 'Manual Review', value: m.stoppedRecoveries },
];

const outcomeTotal = outcomes.reduce((sum, o) => sum + o.value, 0);

const STATUS_META: Record<
    RecoveryActivityStatus,
    { cls: string; label: string }
> = {
    completed: { cls: 'badge--success', label: 'Recovered' },
    waiting_for_customer: { cls: 'badge--warning', label: 'Waiting' },
    failed: { cls: 'badge--danger', label: 'Failed' },
    stopped: { cls: 'badge--neutral', label: 'Manual Review' },
    processing: { cls: 'badge--info', label: 'Processing' },
};

const STRATEGY_LABEL: Record<RecoveryStrategy, string> = {
    retry_payment: 'Auto retry',
    customer_retry: 'Customer retry',
    manual_review: 'Manual review',
};

function pct(value: number): number {
    return outcomeTotal === 0 ? 0 : Math.round((value / outcomeTotal) * 100);
}

export default function OverviewPage() {
    return (
        <div>
            <div className="page-head">
                <h1>Recovery Overview</h1>
                <p>
                    Recovr watches failed Razorpay payments and runs AI-driven
                    recovery &mdash; automatic retries, customer prompts, and
                    manual-review escalation. Below is current exposure and what
                    has been recovered so far.
                </p>
            </div>

            <div className="kpi-grid">
                {kpis.map((k) => (
                    <div className="kpi" key={k.label}>
                        <span className="kpi-label">{k.label}</span>
                        <span className="kpi-value">{k.value}</span>
                        <span className="kpi-hint">{k.hint}</span>
                    </div>
                ))}
            </div>

            <section className="section">
                <div className="section-head">
                    <h2>Recovery Outcomes</h2>
                    <span
                        className="text-faint"
                        style={{ fontSize: 'var(--text-xs)' }}
                    >
                        {formatCount(outcomeTotal)} payments in recovery
                    </span>
                </div>
                <div className="outcome">
                    <div className="outcome-bar">
                        {outcomes
                            .filter((o) => o.value > 0)
                            .map((o) => (
                                <div
                                    key={o.key}
                                    className={`outcome-seg outcome-seg--${o.key}`}
                                    style={{ flexGrow: o.value }}
                                />
                            ))}
                    </div>
                    <div className="outcome-legend">
                        {outcomes.map((o) => (
                            <div className="outcome-item" key={o.key}>
                                <div className="outcome-item-top">
                                    <span
                                        className={`outcome-dot outcome-dot--${o.key}`}
                                    />
                                    <span className="outcome-item-label">
                                        {o.label}
                                    </span>
                                </div>
                                <span className="outcome-item-value">
                                    {formatCount(o.value)}
                                </span>
                                <span className="outcome-item-pct">
                                    {pct(o.value)}% of outcomes
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="section-head">
                    <h2>Recent Recovery Activity</h2>
                    <span
                        className="text-faint"
                        style={{ fontSize: 'var(--text-xs)' }}
                    >
                        Last {recentActivity.length} attempts
                    </span>
                </div>
                <div className="activity">
                    {recentActivity.map((item) => (
                        <div className="activity-row" key={item.attemptId}>
                            <div className="activity-main">
                                <span className="activity-title">
                                    {STRATEGY_LABEL[item.strategy]} &middot;
                                    attempt {item.attemptNumber}/
                                    {item.maxAttempts}
                                </span>
                                <span className="activity-sub">
                                    {item.razorpayPaymentId} &middot;{' '}
                                    {item.method.toUpperCase()}
                                </span>
                            </div>
                            <div className="activity-meta">
                                <span
                                    className={`badge ${STATUS_META[item.status].cls}`}
                                >
                                    {STATUS_META[item.status].label}
                                </span>
                                <span className="activity-amount">
                                    {formatInrFromPaise(item.amount)}
                                </span>
                                <span className="activity-time">
                                    {formatTimestamp(item.createdAt)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
