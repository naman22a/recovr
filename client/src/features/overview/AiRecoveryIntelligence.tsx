import { aiDecisionSummary, strategyDistribution } from './overview.mock';

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

const decisionTotal = strategyDistribution.reduce(
    (sum, item) => sum + item.count,
    0,
);

export default function AiRecoveryIntelligence() {
    return (
        <section className="section">
            <div className="section-head">
                <h2>AI Recovery Intelligence</h2>
                <span
                    className="text-faint"
                    style={{ fontSize: 'var(--text-xs)' }}
                >
                    {decisionTotal} decisions analysed
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
                        {strategyDistribution.map((item) => {
                            const share = Math.round(
                                (item.count / decisionTotal) * 100,
                            );
                            return (
                                <div className="ai-dist-row" key={item.strategy}>
                                    <span className="ai-dist-label">
                                        {item.label}
                                    </span>
                                    <span className="ai-dist-track">
                                        <span
                                            className="ai-dist-fill"
                                            data-strategy={item.strategy}
                                            style={{ width: `${share}%` }}
                                        />
                                    </span>
                                    <span className="ai-dist-val">
                                        {item.count} &middot; {share}%
                                    </span>
                                </div>
                            );
                        })}
                        <p className="ai-dist-foot">
                            Mean confidence{' '}
                            {Math.round(aiDecisionSummary.meanConfidence * 100)}%
                            &middot; {aiDecisionSummary.clearedSafetyRules} of{' '}
                            {aiDecisionSummary.decisions} cleared safety rules
                        </p>
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
