import { STRATEGY_META, type RecoveryStrategy } from '../../lib/recovery';
import type { RecoveryAttemptRow } from './overview.mock';
import type { RecoveryHistoryState } from './useRecoveryHistory';

const STEPS = [
    {
        n: '01',
        title: 'Analyse failure context',
        desc: 'Error code, method, amount and prior attempts are read into context.',
    },
    {
        n: '02',
        title: 'Recommend strategy',
        desc: 'The model proposes a recovery strategy with a confidence score.',
    },
    {
        n: '03',
        title: 'Validate with safety rules',
        desc: 'Deterministic checks confirm attempt caps, amount limits and eligibility.',
    },
    {
        n: '04',
        title: 'Bounded execution',
        desc: 'Recovery runs within fixed limits; failed checks route to manual review.',
    },
];

const STRATEGY_ORDER: RecoveryStrategy[] = [
    'retry_payment',
    'customer_retry',
    'manual_review',
];

function buildDistribution(rows: RecoveryAttemptRow[]) {
    const total = rows.length;
    return STRATEGY_ORDER.map((strategy) => {
        const count = rows.filter((row) => row.strategy === strategy).length;
        return {
            strategy,
            label: STRATEGY_META[strategy].label,
            count,
            share: total === 0 ? 0 : Math.round((count / total) * 100),
        };
    });
}

function meanConfidence(rows: RecoveryAttemptRow[]): number | null {
    const values = rows
        .map((row) => row.confidence)
        .filter((value): value is number => value != null);
    if (values.length === 0) return null;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

interface Props {
    history: RecoveryHistoryState;
}

export default function AiRecoveryIntelligence({ history }: Props) {
    const rows = history.status === 'success' ? history.data : [];
    const total = rows.length;
    const distribution = buildDistribution(rows);
    const meanConf = meanConfidence(rows);

    return (
        <section className="section">
            <div className="section-head">
                <h2>AI Recovery Intelligence</h2>
                <span
                    className="text-faint"
                    style={{ fontSize: 'var(--text-xs)' }}
                >
                    {history.status === 'loading'
                        ? 'Loading…'
                        : history.status === 'error'
                          ? 'History unavailable'
                          : `${total} decision${total === 1 ? '' : 's'} analysed`}
                </span>
            </div>

            <div className="ai-intel">
                <ol className="ai-pipeline">
                    {STEPS.map((step) => (
                        <li className="ai-step" key={step.n}>
                            <span className="ai-step-n">{step.n}</span>
                            <span className="ai-step-title">{step.title}</span>
                            <span className="ai-step-desc">{step.desc}</span>
                        </li>
                    ))}
                </ol>

                <div className="ai-intel-lower">
                    <div className="ai-dist">
                        <span className="eyebrow">Recommended strategy</span>

                        {history.status === 'loading' && (
                            <p className="ai-dist-foot">
                                Loading recovery history&hellip;
                            </p>
                        )}

                        {history.status === 'error' && (
                            <p className="ai-dist-foot">{history.message}</p>
                        )}

                        {history.status === 'success' && total === 0 && (
                            <p className="ai-dist-foot">
                                No recovery attempts yet. The strategy mix
                                appears once recovery runs.
                            </p>
                        )}

                        {history.status === 'success' &&
                            total > 0 &&
                            distribution.map((item) => (
                                <div className="ai-dist-row" key={item.strategy}>
                                    <span className="ai-dist-label">
                                        {item.label}
                                    </span>
                                    <span className="ai-dist-track">
                                        <span
                                            className="ai-dist-fill"
                                            data-strategy={item.strategy}
                                            style={{ width: `${item.share}%` }}
                                        />
                                    </span>
                                    <span className="ai-dist-val">
                                        {item.count} &middot; {item.share}%
                                    </span>
                                </div>
                            ))}

                        {history.status === 'success' &&
                            total > 0 &&
                            meanConf !== null && (
                                <p className="ai-dist-foot">
                                    Mean confidence {Math.round(meanConf * 100)}%
                                    across {total} decision
                                    {total === 1 ? '' : 's'}
                                </p>
                            )}
                    </div>

                    <div className="ai-note">
                        <p className="ai-note-lead">
                            AI recommends. Deterministic safety rules control
                            execution.
                        </p>
                        <p className="ai-note-body">
                            Every recommendation is checked against fixed rules
                            &mdash; attempt caps, amount ceilings, method
                            eligibility &mdash; before any charge is retried.
                            Anything that fails a check is escalated, never
                            forced.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
