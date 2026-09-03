import { formatCount, formatInrFromPaise, formatPercent } from '../../lib/format';
import type { RecoveryMetrics } from './overview.mock';
import { recentAttempts } from './overview.mock';
import { useRecoveryMetrics } from './useRecoveryMetrics';
import AiRecoveryIntelligence from './AiRecoveryIntelligence';
import RecentAttemptsTable from './RecentAttemptsTable';

type OutcomeKey = 'success' | 'warning' | 'danger' | 'neutral';

function buildKpis(
    m: RecoveryMetrics,
): { label: string; value: string; hint: string }[] {
    /* Recovery rate = successful recoveries / total failed payments.
       40% with 4 successes implies 10 failed payments (6 at risk + 4 recovered). */
    const totalFailedPayments = m.paymentsAtRisk + m.successfulRecoveries;

    return [
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
}

function buildOutcomes(
    m: RecoveryMetrics,
): { key: OutcomeKey; label: string; value: number }[] {
    return [
        { key: 'success', label: 'Recovered', value: m.successfulRecoveries },
        {
            key: 'warning',
            label: 'Waiting for Customer',
            value: m.waitingForCustomer,
        },
        { key: 'danger', label: 'Failed', value: m.failedRecoveries },
        { key: 'neutral', label: 'Manual Review', value: m.stoppedRecoveries },
    ];
}

function OverviewMetrics({ m }: { m: RecoveryMetrics }) {
    const kpis = buildKpis(m);
    const outcomes = buildOutcomes(m);
    const outcomeTotal = outcomes.reduce((sum, o) => sum + o.value, 0);
    const pct = (value: number) =>
        outcomeTotal === 0 ? 0 : Math.round((value / outcomeTotal) * 100);

    return (
        <>
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
        </>
    );
}

function MetricsPlaceholder({ children }: { children: string }) {
    return (
        <section className="app-placeholder">
            <p className="eyebrow">Recovery metrics</p>
            <p className="text-muted">{children}</p>
        </section>
    );
}

export default function OverviewPage() {
    const metrics = useRecoveryMetrics();

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

            {metrics.status === 'loading' && (
                <MetricsPlaceholder>
                    Loading recovery metrics&hellip;
                </MetricsPlaceholder>
            )}
            {metrics.status === 'error' && (
                <MetricsPlaceholder>{metrics.message}</MetricsPlaceholder>
            )}
            {metrics.status === 'success' && (
                <OverviewMetrics m={metrics.data} />
            )}

            <AiRecoveryIntelligence />

            <section className="section">
                <div className="section-head">
                    <h2>Recent Recovery Attempts</h2>
                    <span
                        className="text-faint"
                        style={{ fontSize: 'var(--text-xs)' }}
                    >
                        Last {recentAttempts.length} attempts
                    </span>
                </div>
                <RecentAttemptsTable />
            </section>
        </div>
    );
}
