import { NavLink } from 'react-router-dom';
import { FOOTER_NAV, PRIMARY_NAV, type NavItem } from './nav';
import { IconMark } from './icons';

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

function NavList({
    items,
    onNavigate,
}: {
    items: NavItem[];
    onNavigate: () => void;
}) {
    return (
        <>
            {items.map((item) => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className="app-nav-item"
                    onClick={onNavigate}
                >
                    {item.icon}
                    <span>{item.label}</span>
                </NavLink>
            ))}
        </>
    );
}

export default function Sidebar({ open, onClose }: SidebarProps) {
    return (
        <aside
            className="app-sidebar"
            data-open={open ? 'true' : undefined}
            aria-label="Primary"
        >
            <div className="app-brand">
                <span className="app-brand-mark">
                    <IconMark />
                </span>
                <span className="app-brand-text">
                    <span className="app-brand-name">Recovr</span>
                    <span className="app-brand-tag">AI Revenue Recovery</span>
                </span>
            </div>

            <nav className="app-nav" aria-label="Sections">
                <NavList items={PRIMARY_NAV} onNavigate={onClose} />
            </nav>

            <nav className="app-nav app-nav--footer" aria-label="Account">
                <NavList items={FOOTER_NAV} onNavigate={onClose} />
            </nav>
        </aside>
    );
}
