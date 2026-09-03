/* Formatting helpers. Amounts from the API are integer paise. */

const inr = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
});

const count = new Intl.NumberFormat('en-IN');

const dateTime = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
});

/** 2100000 paise -> "₹21,000" */
export function formatInrFromPaise(paise: number): string {
    return inr.format(paise / 100);
}

export function formatCount(value: number): string {
    return count.format(value);
}

export function formatPercent(value: number): string {
    return `${count.format(value)}%`;
}

export function formatTimestamp(iso: string): string {
    return dateTime.format(new Date(iso));
}

const METHOD_LABELS: Record<string, string> = {
    upi: 'UPI',
    card: 'Card',
    netbanking: 'Netbanking',
    wallet: 'Wallet',
    emi: 'EMI',
    paylater: 'Pay Later',
};

export function formatMethod(method: string | null | undefined): string {
    if (!method) return '—';
    return METHOD_LABELS[method] ?? method.toUpperCase();
}
