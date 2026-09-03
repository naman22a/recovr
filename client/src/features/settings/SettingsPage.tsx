import type { ReactNode } from 'react';
import { STRATEGY_META, type RecoveryStrategy } from '../../lib/recovery';

/* Read-only presentation of how Recovr is configured. No API, no persistence,
   no editable controls — these values describe the actual architecture. */

const STRATEGIES: RecoveryStrategy[] = [
    'retry_payment',
    'customer_retry',
    'manual_review',
];

const AI_CONFIG: { name: string; value: string }[] = [
    { name: 'AI Decision Engine', value: 'Ollama + Gemma' },
    { name: 'Decision Temperature', value: '0' },
    { name: 'Decision Output', value: 'Structured JSON' },
    { name: 'Decision Source', value: 'AI Recommendation + Safety Validation' },
];

const INFRASTRUCTURE: { name: string; value: string }[] = [
    { name: 'Payment Provider', value: 'Razorpay Test Mode' },
    { name: 'Background Processing', value: 'BullMQ' },
    { name: 'Cache / Queue Store', value: 'Redis' },
    { name: 'Database', value: 'PostgreSQL' },
    { name: 'Backend', value: 'NestJS' },
    { name: 'Frontend', value: 'React + Vite' },
];

const SAFETY: { name: string; description: string }[] = [
    {
        name: 'Bounded Recovery',
        description: 'Maximum recovery attempts are enforced.',
    },
    {
        name: 'AI Safety Validation',
        description:
            'AI decisions must use a supported strategy and meet the minimum confidence threshold.',
    },
    {
        name: 'Manual Escalation',
        description:
            'Recovery can stop and require manual review instead of continuing indefinitely.',
    },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="section">
            <div className="section-head">
                <h2>{title}</h2>
            </div>
            {children}
        </section>
    );
}

function Row({
    name,
    value,
    description,
    children,
}: {
    name: string;
    value?: string;
    description?: string;
    children?: ReactNode;
}) {
    return (
        <div className="setting-row">
            <span className="setting-name">{name}</span>
            {value !== undefined && (
                <span className="setting-value">{value}</span>
            )}
            {description && <p className="setting-desc">{description}</p>}
            {children && <div className="setting-block">{children}</div>}
        </div>
    );
}

export default function SettingsPage() {
    return (
        <div>
            <div className="page-head">
                <h1>Settings</h1>
                <p>View recovery and system configuration.</p>
            </div>

            <div className="env-indicator">
                <span className="badge badge--warning">Test Mode</span>
                <span className="env-indicator-text">
                    Recovr is currently configured for Razorpay Test Mode.
                </span>
            </div>

            <Section title="Recovery Configuration">
                <div className="card">
                    <Row
                        name="Maximum Recovery Attempts"
                        value="3"
                        description="Maximum number of automated recovery attempts allowed for a payment."
                    />
                    <Row
                        name="Minimum AI Confidence"
                        value="50%"
                        description="Minimum confidence required for an AI recovery recommendation to pass safety validation."
                    />
                    <Row
                        name="Recovery Strategies"
                        description="Recovery strategies currently supported by Recovr."
                    >
                        {STRATEGIES.map((strategy) => (
                            <span
                                key={strategy}
                                className={`badge ${STRATEGY_META[strategy].badgeClass}`}
                            >
                                {STRATEGY_META[strategy].label}
                            </span>
                        ))}
                    </Row>
                </div>
            </Section>

            <Section title="AI Configuration">
                <div className="card">
                    {AI_CONFIG.map((item) => (
                        <Row
                            key={item.name}
                            name={item.name}
                            value={item.value}
                        />
                    ))}
                    <p className="card-note">
                        AI recommends recovery actions while deterministic
                        application logic controls execution.
                    </p>
                </div>
            </Section>

            <Section title="Infrastructure">
                <div className="card">
                    {INFRASTRUCTURE.map((item) => (
                        <Row
                            key={item.name}
                            name={item.name}
                            value={item.value}
                        />
                    ))}
                </div>
            </Section>

            <Section title="Safety & Recovery">
                <div className="card card--accent">
                    {SAFETY.map((item) => (
                        <Row
                            key={item.name}
                            name={item.name}
                            description={item.description}
                        />
                    ))}
                </div>
            </Section>
        </div>
    );
}
