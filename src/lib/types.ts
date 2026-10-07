/**
 * Shared data types for the HEFA mobile app.
 *
 * These mirror the website's src/lib/types.ts deliberately. The two apps read
 * the same database, so if the property names drifted apart, every screen here
 * would need translating.
 */

export type CategoryName = 'Corporate' | 'Casual';

export interface Product {
  id: string;
  /** URL-friendly identifier, used for the product route. */
  slug: string;
  name: string;
  /** Price in whole Naira — never kobo. */
  price: number;
  category: CategoryName;
  colors: string[];
  sizes: string[];
  description: string;
  details: string[];
  /** Hex colour shown while a photo loads, or if it is missing. */
  swatch: string;
  /**
   * Photo paths as stored in the database, e.g. "/images/products/foo-1.jpg".
   *
   * A phone cannot load a path like that, so these are translated into local
   * image files by src/lib/productImages.ts before anything renders them.
   */
  images: string[];
  /** Shows in the home screen's Featured row. */
  featured: boolean;
  /** Optional label such as "New" or "Best seller". */
  badge?: string;
  inStock: boolean;
}

export interface Category {
  slug: 'corporate' | 'casual';
  name: CategoryName;
  description: string;
  /** Hex stand-in, used only when no photograph is available. */
  swatch: string;
}

/**
 * Where an order is in its life.
 *
 * These are the raw database values (lowercase), matching the website's
 * src/lib/types.ts. The capitalised labels a customer reads are derived from
 * these when rendering.
 */
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  productId: string;
  /** Snapshotted at purchase time, so later catalogue edits never rewrite history. */
  productName: string;
  productSlug: string;
  color: string;
  size: string;
  quantity: number;
  /** Price per unit in whole Naira, at the time of purchase. */
  unitPrice: number;
  /** unitPrice × quantity. */
  lineTotal: number;
}

export interface Order {
  id: string;
  /** Short customer-facing reference, e.g. "HEFA-1042". */
  reference: string;
  userId: string | null;
  email: string;
  phone: string;
  status: OrderStatus;
  /** Money is whole Naira throughout, matching the products table. */
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  shippingMethod: string;
  shippingLabel: string;
  address1: string;
  address2: string | null;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  /** Paystack's reference. Null until payment succeeds. */
  paymentReference: string | null;
  paidAt: string | null;
  createdAt: string;
  items: OrderItem[];
}

/** A saved delivery address in the customer's address book. */
export interface Address {
  id: string;
  label: string;
  name: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

