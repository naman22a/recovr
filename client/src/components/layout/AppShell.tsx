import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { NAV_LABELS, type NavId } from './nav';
import OverviewPage from '../../features/overview/OverviewPage';

export default function AppShell() {
    const [active, setActive] = useState<NavId>('overview');
    const [navOpen, setNavOpen] = useState(false);

    return (
        <div className="app-shell">
            <Sidebar
                active={active}
                onNavigate={setActive}
                open={navOpen}
                onClose={() => setNavOpen(false)}
            />

            {navOpen && (
                <div
                    className="app-scrim"
                    onClick={() => setNavOpen(false)}
                    aria-hidden="true"
                />
            )}

            <Header
                title={NAV_LABELS[active]}
                onMenu={() => setNavOpen(true)}
            />

            <main className="app-main">
                <div className="app-main-inner">
                    {active === 'overview' ? (
                        <OverviewPage />
                    ) : (
                        <section className="app-placeholder">
                            <p className="eyebrow">{NAV_LABELS[active]}</p>
                            <p className="text-muted">
                                This section has not been built yet.
                            </p>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}
