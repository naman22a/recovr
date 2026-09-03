import { FOOTER_NAV, PRIMARY_NAV, type NavId, type NavItem } from './nav';
import { IconMark } from './icons';

interface SidebarProps {
    active: NavId;
    onNavigate: (id: NavId) => void;
    open: boolean;
    onClose: () => void;
}

function NavList({
    items,
    active,
    onSelect,
}: {
    items: NavItem[];
    active: NavId;
    onSelect: (id: NavId) => void;
}) {
    return (
        <>
            {items.map((item) => (
                <button
                    key={item.id}
                    type="button"
                    className="app-nav-item"
                    aria-current={item.id === active ? 'page' : undefined}
                    onClick={() => onSelect(item.id)}
                >
                    {item.icon}
                    <span>{item.label}</span>
                </button>
            ))}
        </>
    );
}

export default function Sidebar({
    active,
    onNavigate,
    open,
    onClose,
}: SidebarProps) {
    const select = (id: NavId) => {
        onNavigate(id);
        onClose();
    };

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
                <NavList items={PRIMARY_NAV} active={active} onSelect={select} />
            </nav>

            <nav className="app-nav app-nav--footer" aria-label="Account">
                <NavList items={FOOTER_NAV} active={active} onSelect={select} />
            </nav>
        </aside>
    );
}
