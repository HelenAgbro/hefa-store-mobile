/**
 * Format a whole-Naira amount for display, e.g. 68000 -> "₦68,000".
 *
 * Prices are stored as whole Naira throughout the app and the database, so
 * there are no kobo (cents) to worry about and no rounding to get wrong.
 * Paystack, however, expects kobo — that conversion happens server-side at
 * checkout, never here.
 */
export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a stored timestamp for display, e.g. "12 Jun 2026".
 *
 * Order dates are stored as ISO strings. A malformed or missing value shows as
 * an em dash rather than "Invalid Date", so a bad record never looks like a bug
 * in the app itself.
 */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

