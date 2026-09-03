/* Inline icon set for the app shell — 24px grid, 1.5 stroke, currentColor.
   Kept local and dependency-free; geometric, not decorative. */

type IconProps = { className?: string };

const svg = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
} as const;

export function IconMark(props: IconProps) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
            <path d="M5 3.4h7.3a5 5 0 0 1 1.86 9.64l3.44 7.46h-3.72l-3.02-6.42H8.4v6.42H5V3.4Zm3.4 7.16h3.6a2.16 2.16 0 0 0 0-4.32H8.4v4.32Z" />
        </svg>
    );
}

export function IconOverview(props: IconProps) {
    return (
        <svg {...svg} {...props}>
            <rect x="3" y="3" width="7.5" height="9" rx="1.5" />
            <rect x="13.5" y="3" width="7.5" height="5.5" rx="1.5" />
            <rect x="13.5" y="12" width="7.5" height="9" rx="1.5" />
            <rect x="3" y="15.5" width="7.5" height="5.5" rx="1.5" />
        </svg>
    );
}

export function IconRecovery(props: IconProps) {
    return (
        <svg {...svg} {...props}>
            <path d="M20.5 12a8.5 8.5 0 1 1-2.5-6" />
            <path d="M20.5 4v5h-5" />
        </svg>
    );
}

export function IconPayments(props: IconProps) {
    return (
        <svg {...svg} {...props}>
            <rect x="2.5" y="5" width="19" height="14" rx="2" />
            <path d="M2.5 10h19" />
            <path d="M6 15h4" />
        </svg>
    );
}

export function IconDecisions(props: IconProps) {
    return (
        <svg {...svg} {...props}>
            <rect x="7" y="7" width="10" height="10" rx="1.5" />
            <rect x="10.5" y="10.5" width="3" height="3" rx="0.5" />
            <path d="M10 2.75v3M14 2.75v3M10 18.25v3M14 18.25v3M2.75 10h3M2.75 14h3M18.25 10h3M18.25 14h3" />
        </svg>
    );
}

export function IconAnalytics(props: IconProps) {
    return (
        <svg {...svg} {...props}>
            <path d="M4 4v16h16" />
            <path d="M8 16v-3.5M13 16V8M18 16v-6.5" />
        </svg>
    );
}

export function IconSettings(props: IconProps) {
    return (
        <svg {...svg} {...props}>
            <path d="M4 7h8M17 7h3" />
            <path d="M4 12h3M12 12h8" />
            <path d="M4 17h7M16 17h4" />
            <circle cx="14" cy="7" r="2.1" />
            <circle cx="9" cy="12" r="2.1" />
            <circle cx="13" cy="17" r="2.1" />
        </svg>
    );
}

export function IconMenu(props: IconProps) {
    return (
        <svg {...svg} {...props}>
            <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
        </svg>
    );
}

export function IconAccount(props: IconProps) {
    return (
        <svg {...svg} {...props}>
            <circle cx="12" cy="8.5" r="3.75" />
            <path d="M4.75 19.5a7.5 7.5 0 0 1 14.5 0" />
        </svg>
    );
}
