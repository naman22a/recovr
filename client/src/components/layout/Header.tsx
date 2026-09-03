import { IconAccount, IconMenu } from './icons';

interface HeaderProps {
    title: string;
    onMenu: () => void;
}

export default function Header({ title, onMenu }: HeaderProps) {
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
                    <span className="crumb">/</span>
                    <span className="current">{title}</span>
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
