/**
 * Checkout, over the API.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS IS
 * ---------------------------------------------------------------------------
 * Two calls, matching the two halves of paying on the phone:
 *
 *   startCheckout()  POST /api/checkout            create the order, get a
 *                                                  Paystack payment URL back
 *   confirmOrder()   GET  /api/orders/[reference]  ask the server whether the
 *                                                  payment actually went through
 *
 * ---------------------------------------------------------------------------
 * WHY THE SERVER OWNS THE MONEY
 * ---------------------------------------------------------------------------
 * The app sends only product ids, options and quantities — never a price. The
 * server re-prices every line from the database, saves a pending order and
 * asks Paystack for a payment URL. The app never sees a secret key and cannot
 * invent a total, which is exactly why the phone and the website can never
 * disagree about what a customer owes.
 *
 * ---------------------------------------------------------------------------
 * WHY A CALLBACK TO THE APP
 * ---------------------------------------------------------------------------
 * Paystack sends the browser to whatever callbackUrl we give it. We hand it a
 * deep link back into this app (hefamobile://checkout/verify?...) so the
 * browser closes and control returns here the moment payment finishes. The
 * {reference} and {token} placeholders are filled in by the server, which is
 * how the return trip proves the customer really was sent to Paystack rather
 * than having guessed a reference.
 */

import { apiFetch } from '@/lib/api';
import type { CartItem } from '@/lib/cart-api';
import type { CheckoutValues } from '@/lib/checkout';

/**
 * The deep link Paystack returns to after payment.
 *
 * The scheme comes from app.json ("hefamobile"), and the two placeholders are
 * replaced server-side. Keeping it here means the app and the server agree on
 * one address rather than the app having to know how to build it.
 */
export const CHECKOUT_CALLBACK_URL =
  'hefamobile://checkout/verify?reference={reference}&token={token}';

export interface StartedCheckout {
  /** Where to send the customer to pay. */
  authorizationUrl: string;
  /** Our order reference, e.g. "HEFA-3962". */
  reference: string;
  /** Proves the return trip came from Paystack. Used by confirmOrder(). */
  token: string;
  /** The order total in whole Naira, as priced by the server. */
  total: number;
}

/** Create the order and get a Paystack payment URL. */
export async function startCheckout(input: {
  values: CheckoutValues;
  items: CartItem[];
  accessToken?: string | null;
}): Promise<StartedCheckout> {
  // Only ids, options and quantities cross the wire. No prices: the server
  // would ignore them, and sending them would only invite a mismatch.
  const lines = input.items.map((item) => ({
    productId: item.productId,
    color: item.color,
    size: item.size,
    quantity: item.quantity,
  }));

  return apiFetch<StartedCheckout>('/api/checkout', {
    method: 'POST',
    accessToken: input.accessToken,
    body: {
      values: input.values,
      lines,
      callbackUrl: CHECKOUT_CALLBACK_URL,
    },
  });
}

/** A confirmation answer from the server. */
export interface OrderStatus {
  /** "paid" | "success" | "failed" | "abandoned" | "unknown" | "mismatch" | ... */
  status: string;
  /** A customer-readable note, when the server has one (e.g. a mismatch). */
  message?: string;
}

/**
 * Ask the server whether a payment went through.
 *
 * The server re-checks with Paystack itself and marks the order paid, so this
 * is the authority — the app never decides an order is paid on its own.
 */
export async function confirmOrder(reference: string, token: string): Promise<OrderStatus> {
  const query = `?token=${encodeURIComponent(token)}`;
  return apiFetch<OrderStatus>(`/api/orders/${encodeURIComponent(reference)}${query}`);
}
