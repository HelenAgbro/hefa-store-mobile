/**
 * The shared cart, over the API.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS IS
 * ---------------------------------------------------------------------------
 * Five small functions, one per cart endpoint the web app exposes:
 *
 *   GET    /api/cart              read the signed-in customer's cart
 *   POST   /api/cart/items        add a line (or top up the matching one)
 *   PATCH  /api/cart/items/[id]   change a line's quantity (0 removes it)
 *   DELETE /api/cart/items/[id]   remove a line
 *   DELETE /api/cart              empty the bag
 *
 * Every answer is the whole recalculated cart — items, totalItems, subtotal —
 * priced from the products table on the server. The app renders what it is
 * told and never computes money itself, which is exactly how the two apps
 * stay in agreement no matter which device made the change.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS IS NOT
 * ---------------------------------------------------------------------------
 * It holds no state. Screens never call these directly for display; they go
 * through CartContext (src/context/CartContext.tsx), which keeps one shared
 * answer and decides between the server cart (signed in) and a local guest
 * cart (signed out).
 */

import { apiFetch, toProduct } from '@/lib/api';
import type { Product } from '@/lib/types';

/** One bag line as the server returns it — priced and joined to its product. */
export interface CartItem {
  id: string;
  productId: string;
  color: string;
  size: string;
  quantity: number;
  product: Product;
  lineTotal: number;
}

/** The whole bag: lines plus the two numbers the UI shows. */
export interface Cart {
  items: CartItem[];
  /** Sum of quantities — the number on the bag button. */
  totalItems: number;
  /** Sum of line totals, in whole Naira. */
  subtotal: number;
}

interface RawCartItem {
  id: string;
  productId?: string;
  product_id?: string;
  color: string;
  size: string;
  quantity: number;
  product: Record<string, unknown>;
  lineTotal?: number;
  line_total?: number;
}

interface RawCart {
  items?: RawCartItem[];
  totalItems?: number;
  total_items?: number;
  subtotal?: number;
}

/**
 * Normalise the server's answer.
 *
 * Accepts both camelCase and snake_case keys so a future API rename cannot
 * silently empty the bag — unknown keys fall back to computed values.
 */
export function toCart(data: RawCart): Cart {
  const items: CartItem[] = (data.items ?? []).map((row) => {
    // The product arrives nested; cast through unknown because its exact
    // shape (optional vs required fields) differs slightly from ours.
    const product = toProduct(row.product as unknown as Parameters<typeof toProduct>[0]);
    const productId = String(row.productId ?? row.product_id ?? product.id);
    const quantity = Number(row.quantity ?? 1);
    return {
      id: String(row.id),
      productId,
      color: String(row.color ?? ''),
      size: String(row.size ?? ''),
      quantity,
      product,
      lineTotal: Number(row.lineTotal ?? row.line_total ?? product.price * quantity),
    };
  });

  return {
    items,
    totalItems: Number(
      data.totalItems ?? data.total_items ?? items.reduce((sum, item) => sum + item.quantity, 0),
    ),
    subtotal: Number(
      data.subtotal ?? items.reduce((sum, item) => sum + item.lineTotal, 0),
    ),
  };
}

/** An empty bag, for sign-out and for a fresh guest. */
export const EMPTY_CART: Cart = { items: [], totalItems: 0, subtotal: 0 };

/** Read the signed-in customer's bag. Needs the access token. */
export async function fetchCart(accessToken: string): Promise<Cart> {
  return toCart(await apiFetch<RawCart>('/api/cart', { accessToken }));
}

export interface AddItemInput {
  productId: string;
  color: string;
  size: string;
  quantity?: number;
}

/** Add a line (or top up the matching product + colour + size). */
export async function addCartItem(accessToken: string, input: AddItemInput): Promise<Cart> {
  return toCart(
    await apiFetch<RawCart>('/api/cart/items', {
      method: 'POST',
      accessToken,
      body: {
        productId: input.productId,
        color: input.color,
        size: input.size,
        quantity: input.quantity ?? 1,
      },
    }),
  );
}

/** Change a line's quantity. Sending 0 removes the line. */
export async function updateCartItemQuantity(
  accessToken: string,
  lineId: string,
  quantity: number,
): Promise<Cart> {
  return toCart(
    await apiFetch<RawCart>(`/api/cart/items/${encodeURIComponent(lineId)}`, {
      method: 'PATCH',
      accessToken,
      body: { quantity },
    }),
  );
}

/** Remove one line from the bag. */
export async function removeCartItem(accessToken: string, lineId: string): Promise<Cart> {
  return toCart(
    await apiFetch<RawCart>(`/api/cart/items/${encodeURIComponent(lineId)}`, {
      method: 'DELETE',
      accessToken,
    }),
  );
}

/** Empty the whole bag. */
export async function clearCart(accessToken: string): Promise<Cart> {
  return toCart(await apiFetch<RawCart>('/api/cart', { method: 'DELETE', accessToken }));
}
