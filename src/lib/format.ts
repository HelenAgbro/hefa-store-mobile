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
