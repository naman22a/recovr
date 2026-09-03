import type { ReactNode } from 'react';
import { formatCount, formatInrFromPaise, formatPercent } from '../../lib/format';
import type { RecoveryMetrics } from '../overview/overview.mock';
import {
    useRecoveryMetrics,
    type RecoveryMetricsState,
} from '../overview/useRecoveryMetrics';

function toFinite(value: number): number {
    return Number.isFinite(value) ? value : 0;
}

/** Coerce every field to a finite number so nothing renders as NaN/Infinity/null. */
function normalize(data: RecoveryMetrics): RecoveryMetrics {
    return {
        paymentsAtRisk: toFinite(data.paymentsAtRisk),
        totalAmountAtRisk: toFinite(data.totalAmountAtRisk),
        totalRecoveryAttempts: toFinite(data.totalRecoveryAttempts),
        successfulRecoveries: toFinite(data.successfulRecoveries),
        amountRecovered: toFinite(data.amountRecovered),
        recoveryRate: toFinite(data.recoveryRate),
        waitingForCustomer: toFinite(data.waitingForCustomer),
        failedRecoveries: toFinite(data.failedRecoveries),
        stoppedRecoveries: toFinite(data.stoppedRecoveries),
    };
}

function isEmpty(m: RecoveryMetrics): boolean {
    return (
        m.paymentsAtRisk +
            m.totalAmountAtRisk +
            m.totalRecoveryAttempts +
            m.successfulRecoveries +
            m.amountRecovered +
            m.waitingForCustomer +
            m.failedRecoveries +
            m.stoppedRecoveries ===
        0
    );
}

function PageHeader() {
    return (
        <div className="page-head">
            <h1>Analytics</h1>
            <p>Measure the impact of automated payment recovery.</p>
        </div>
    );
}

function Placeholder({
    eyebrow,
    text,
    action,
}: {
    eyebrow: string;
    text: string;
    action?: ReactNode;
}) {
    return (
        <section className="app-placeholder">
            <p className="eyebrow">{eyebrow}</p>
            <p className="text-muted">{text}</p>
            {action}
        </section>
    );
}

type OutcomeKey = 'success' | 'warning' | 'danger' | 'neutral';

function AnalyticsBody({ m }: { m: RecoveryMetrics }) {
    // Two independent amounts on one shared scale (the larger of the two).
    const financialScaleMax = Math.max(m.amountRecovered, m.totalAmountAtRisk);
    const financialEmpty = financialScaleMax === 0;
    const recoveredWidth = financialEmpty
        ? 0
        : (m.amountRecovered / financialScaleMax) * 100;
    const atRiskWidth = financialEmpty
        ? 0
        : (m.totalAmountAtRisk / financialScaleMax) * 100;

    const avgAttempts =
        m.successfulRecoveries === 0
            ? 0
            : m.totalRecoveryAttempts / m.successfulRecoveries;

    const kpis = [
        {
            label: 'Amount Recovered',
            value: formatInrFromPaise(m.amountRecovered),
            hint: `of ${formatInrFromPaise(m.totalAmountAtRisk)} at risk`,
        },
        {
            label: 'Recovery Rate',
            value: formatPercent(m.recoveryRate),
            hint: 'successful recoveries ÷ failed payments',
        },
        {
            label: 'Successful Recoveries',
            value: formatCount(m.successfulRecoveries),
            hint: `across ${formatCount(m.totalRecoveryAttempts)} attempts`,
        },
        {
            label: 'Payments At Risk',
            value: formatCount(m.paymentsAtRisk),
            hint: `${formatInrFromPaise(m.totalAmountAtRisk)} still exposed`,
        },
    ];

    const outcomes: { key: OutcomeKey; label: string; value: number }[] = [
        {
            key: 'success',
            label: 'Successful Recoveries',
            value: m.successfulRecoveries,
        },
        {
            key: 'warning',
            label: 'Waiting for Customer',
            value: m.waitingForCustomer,
        },
        {
            key: 'danger',
            label: 'Failed Recoveries',
            value: m.failedRecoveries,
        },
        {
            key: 'neutral',
            label: 'Stopped Recoveries',
            value: m.stoppedRecoveries,
        },
    ];
    const outcomeTotal = outcomes.reduce((sum, o) => sum + o.value, 0);
    const outcomePct = (value: number) =>
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
                    <h2>Financial impact</h2>
                </div>
                <div className="impact">
                    {financialEmpty ? (
                        <p className="impact-caption">
                            No amounts recorded yet. Recovered and at-risk
                            figures appear once payments are processed.
                        </p>
                    ) : (
                        <div className="impact-rows">
                            <div className="impact-row">
                                <div className="impact-row-head">
                                    <span className="impact-figure-label">
                                        Recovered
                                    </span>
                                    <span className="metric">
                                        {formatInrFromPaise(m.amountRecovered)}
                                    </span>
                                </div>
                                <div
                                    className="impact-bar"
                                    role="img"
                                    aria-label={`Recovered ${formatInrFromPaise(m.amountRecovered)}`}
                                >
                                    <span
                                        className="impact-bar-fill impact-bar-fill--recovered"
                                        style={{ width: `${recoveredWidth}%` }}
                                    />
                                </div>
                            </div>
                            <div className="impact-row">
                                <div className="impact-row-head">
                                    <span className="impact-figure-label">
                                        Currently At Risk
                                    </span>
                                    <span className="metric">
                                        {formatInrFromPaise(
                                            m.totalAmountAtRisk,
                                        )}
                                    </span>
                                </div>
                                <div
                                    className="impact-bar"
                                    role="img"
                                    aria-label={`Currently at risk ${formatInrFromPaise(m.totalAmountAtRisk)}`}
                                >
                                    <span
                                        className="impact-bar-fill impact-bar-fill--risk"
                                        style={{ width: `${atRiskWidth}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="section">
                <div className="section-head">
                    <h2>Recovery outcomes</h2>
                    <span
                        className="text-faint"
                        style={{ fontSize: 'var(--text-xs)' }}
                    >
                        {formatCount(outcomeTotal)} payments
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
                                    {outcomePct(o.value)}% of outcomes
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section">
                <div className="section-head">
                    <h2>Recovery activity</h2>
                </div>
                <div className="kpi-grid">
                    <div className="kpi">
                        <span className="kpi-label">
                            Total Recovery Attempts
                        </span>
                        <span className="kpi-value">
                            {formatCount(m.totalRecoveryAttempts)}
                        </span>
                        <span className="kpi-hint">across all payments</span>
                    </div>
                    <div className="kpi">
                        <span className="kpi-label">
                            Avg Attempts per Successful Recovery
                        </span>
                        <span className="kpi-value">
                            {avgAttempts.toFixed(1)}
                        </span>
                        <span className="kpi-hint">
                            Derived metric — total attempts ÷ successful
                            recoveries
                        </span>
                    </div>
                </div>
            </section>
        </>
    );
}

function AnalyticsContent({
    metrics,
    onRetry,
}: {
    metrics: RecoveryMetricsState;
    onRetry: () => void;
}) {
    if (metrics.status === 'loading') {
        return <Placeholder eyebrow="Analytics" text="Loading analytics…" />;
    }

    if (metrics.status === 'error') {
        return (
            <Placeholder
                eyebrow="Analytics unavailable"
                text={metrics.message}
                action={
                    <button
                        type="button"
                        className="btn btn--sm"
                        onClick={onRetry}
                    >
                        Retry
                    </button>
                }
            />
        );
    }

    const m = normalize(metrics.data);

    if (isEmpty(m)) {
        return (
            <Placeholder
                eyebrow="No recovery activity yet"
                text="Run a simulation or process a failed payment to generate analytics."
            />
        );
    }

    return <AnalyticsBody m={m} />;
}

export default function AnalyticsPage() {
    const [metrics, refetch] = useRecoveryMetrics();

    return (
        <div>
            <PageHeader />
            <AnalyticsContent metrics={metrics} onRetry={refetch} />
        </div>
    );
}
