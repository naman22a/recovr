import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

export default function AppShell() {
    const [navOpen, setNavOpen] = useState(false);

    return (
        <div className="app-shell">
            <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

            {navOpen && (
                <div
                    className="app-scrim"
                    onClick={() => setNavOpen(false)}
                    aria-hidden="true"
                />
            )}

            <Header onMenu={() => setNavOpen(true)} />

            <main className="app-main">
                <div className="app-main-inner">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
