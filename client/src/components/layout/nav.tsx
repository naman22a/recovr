/* Navigation model for the app shell — one entry per route. */

import type { ReactNode } from 'react';
import {
    IconAnalytics,
    IconDecisions,
    IconOverview,
    IconPayments,
    IconRecovery,
    IconSettings,
} from './icons';

export interface NavItem {
    to: string;
    label: string;
    icon: ReactNode;
}

export const PRIMARY_NAV: NavItem[] = [
    { to: '/', label: 'Overview', icon: <IconOverview /> },
    {
        to: '/recovery-attempts',
        label: 'Recovery Attempts',
        icon: <IconRecovery />,
    },
    { to: '/payments', label: 'Payments', icon: <IconPayments /> },
    { to: '/ai-decisions', label: 'AI Decisions', icon: <IconDecisions /> },
    { to: '/analytics', label: 'Analytics', icon: <IconAnalytics /> },
];

export const FOOTER_NAV: NavItem[] = [
    { to: '/settings', label: 'Settings', icon: <IconSettings /> },
];

export const NAV_ITEMS: NavItem[] = [...PRIMARY_NAV, ...FOOTER_NAV];
