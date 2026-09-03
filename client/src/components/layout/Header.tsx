import { Fragment } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { IconAccount, IconMenu } from './icons';
import { NAV_ITEMS } from './nav';

interface HeaderProps {
    onMenu: () => void;
}

function crumbsFor(pathname: string, paymentId?: string): string[] {
    if (pathname === '/') return ['Overview'];
    if (paymentId) return ['Payments', `#${paymentId}`];
    const item = NAV_ITEMS.find(
        (nav) => nav.to !== '/' && pathname.startsWith(nav.to),
    );
    return [item ? item.label : 'Not found'];
}

export default function Header({ onMenu }: HeaderProps) {
    const { pathname } = useLocation();
    const { paymentId } = useParams();
    const crumbs = crumbsFor(pathname, paymentId);

    return (
        <header className="app-header">
            <div className="app-header-left">
                <button
                    type="button"
                    className="icon-btn app-menu-btn"
                    onClick={onMenu}
                    aria-label="Open navigation"
                >
                    <IconMenu />
                </button>
                <div className="app-header-title">
                    <span className="crumb">Recovr</span>
                    {crumbs.map((crumb, index) => (
                        <Fragment key={crumb}>
                            <span className="crumb">/</span>
                            <span
                                className={
                                    index === crumbs.length - 1
                                        ? 'current'
                                        : 'crumb'
                                }
                            >
                                {crumb}
                            </span>
                        </Fragment>
                    ))}
                </div>
            </div>

            <div className="app-header-right">
                <button type="button" className="icon-btn" aria-label="Account">
                    <IconAccount />
                </button>
            </div>
        </header>
    );
}
