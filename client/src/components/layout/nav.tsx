/* Navigation model for the app shell.
   Single source for section ids, labels and icons — no routing yet. */

import type { ReactNode } from 'react';
import {
    IconAnalytics,
    IconDecisions,
    IconOverview,
    IconPayments,
    IconRecovery,
    IconSettings,
} from './icons';

export type NavId =
    | 'overview'
    | 'recovery-attempts'
    | 'payments'
    | 'ai-decisions'
    | 'analytics'
    | 'settings';

export interface NavItem {
    id: NavId;
    label: string;
    icon: ReactNode;
}

export const PRIMARY_NAV: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: <IconOverview /> },
    {
        id: 'recovery-attempts',
        label: 'Recovery Attempts',
        icon: <IconRecovery />,
    },
    { id: 'payments', label: 'Payments', icon: <IconPayments /> },
    { id: 'ai-decisions', label: 'AI Decisions', icon: <IconDecisions /> },
    { id: 'analytics', label: 'Analytics', icon: <IconAnalytics /> },
];

export const FOOTER_NAV: NavItem[] = [
    { id: 'settings', label: 'Settings', icon: <IconSettings /> },
];

export const NAV_LABELS: Record<NavId, string> = Object.fromEntries(
    [...PRIMARY_NAV, ...FOOTER_NAV].map((item) => [item.id, item.label]),
) as Record<NavId, string>;
