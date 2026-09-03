import { useEffect, useRef, useState } from 'react';
import { simulateRecovery } from './overview.api';

const COUNT_OPTIONS = [5, 10, 20, 50] as const;

type Phase = 'idle' | 'running' | 'done';

interface Props {
    /** Called after a successful simulation so the caller can refresh data. */
    onCompleted: () => void;
}

export default function SimulateRecovery({ onCompleted }: Props) {
    const [open, setOpen] = useState(false);
    const [count, setCount] = useState<number>(10);
    const [phase, setPhase] = useState<Phase>('idle');
    const [error, setError] = useState<string | null>(null);
    const dialogRef = useRef<HTMLDivElement>(null);

    const running = phase === 'running';

    useEffect(() => {
        if (!open) return;
        dialogRef.current?.focus();
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && phase !== 'running') setOpen(false);
        };
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', onKey);
        };
    }, [open, phase]);

    function closeModal() {
        if (running) return;
        setOpen(false);
        setError(null);
    }

    async function submit() {
        if (running) return;
        setPhase('running');
        setError(null);
        try {
            await simulateRecovery(count);
            onCompleted();
            setOpen(false);
            setPhase('done');
            window.setTimeout(() => setPhase('idle'), 4000);
        } catch (err) {
            setPhase('idle');
            setError(
                err instanceof Error
                    ? err.message
                    : 'Simulation failed. Please try again.',
            );
        }
    }

    return (
        <>
            <button
                type="button"
                className="btn btn--primary"
                onClick={() => setOpen(true)}
            >
                Simulate Recovery
            </button>

            {open && (
                <div
                    className="modal-scrim"
                    onClick={closeModal}
                    role="presentation"
                >
                    <div
                        className="modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="simulate-title"
                        tabIndex={-1}
                        ref={dialogRef}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="modal-head">
                            <h2 id="simulate-title">Simulate recovery</h2>
                            <button
                                type="button"
                                className="icon-btn"
                                onClick={closeModal}
                                aria-label="Close"
                                disabled={running}
                            >
                                &times;
                            </button>
                        </div>

                        <p className="modal-desc">
                            Generate simulated failed payments and run the AI
                            recovery pipeline against them.
                        </p>

                        <fieldset className="sim-fieldset" disabled={running}>
                            <legend className="eyebrow">
                                Payments to simulate
                            </legend>
                            <div className="sim-counts">
                                {COUNT_OPTIONS.map((option) => (
                                    <label
                                        key={option}
                                        className="sim-count"
                                        data-selected={option === count}
                                    >
                                        <input
                                            type="radio"
                                            name="simulate-count"
                                            value={option}
                                            checked={option === count}
                                            onChange={() => setCount(option)}
                                        />
                                        {option}
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        {running && (
                            <p className="sim-status">
                                <span className="sim-pulse" aria-hidden="true" />
                                Running AI recovery simulation&hellip;
                            </p>
                        )}
                        {error && <p className="sim-error">{error}</p>}

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn"
                                onClick={closeModal}
                                disabled={running}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn--primary"
                                onClick={submit}
                                disabled={running}
                            >
                                {running ? 'Running…' : `Simulate ${count}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {phase === 'done' && (
                <div className="toast" role="status">
                    Simulated {count} payments &mdash; metrics and history
                    refreshed.
                </div>
            )}
        </>
    );
}
