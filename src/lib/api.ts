/**
 * One front door for every call to the HEFA API.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS IS
 * ---------------------------------------------------------------------------
 * The website and the API live together on one Vercel project
 * (https://hefa-store-one.vercel.app). The app only needs that address, which
 * comes from EXPO_PUBLIC_API_BASE_URL in .env.local.
 *
 * Every function here:
 *   1. prefixes the path with that address,
 *   2. attaches the customer's Supabase access token as a Bearer header when
 *      someone is signed in (the API accepts either this or the website's
 *      cookie — see src/lib/api-auth.ts over in the web app),
 *   3. returns the server's answer, or throws the server's own error message.
 *      The API already writes messages a customer can read
 *      ("Please sign in to see your bag."), so the app shows them as-is
 *      instead of inventing its own wording.
 *
 * ---------------------------------------------------------------------------
 * WHY ONE FILE
 * ---------------------------------------------------------------------------
 * Five endpoints, one calling convention. Without this, each screen would
 * re-implement auth headers and error handling slightly differently, and a
 * fix in one place would never reach the others.
 */

import type { Product } from '@/lib/types';

/** The website + API address. Defaults to production when the env var is missing. */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://hefa-store-one.vercel.app';

/** A product as the API sends it. Optional fields get defaults on the way in. */
interface ApiProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  category: 'Corporate' | 'Casual';
  colors?: string[];
  sizes?: string[];
  description?: string;
  details?: string[];
  swatch?: string;
  images?: string[];
  featured?: boolean;
  badge?: string;
  in_stock?: boolean;
  inStock?: boolean;
}

/**
 * Fill in the API's optional fields so the result matches our Product type.
 *
 * The website's Product marks images/featured as optional; ours requires them.
 * Defaults keep a slightly-off API response rendering instead of crashing.
 */
export function toProduct(row: ApiProduct): Product {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    price: Number(row.price),
    category: row.category,
    colors: row.colors ?? [],
    sizes: row.sizes ?? [],
    description: String(row.description ?? ''),
    details: row.details ?? [],
    swatch: String(row.swatch ?? '#2f2f2f'),
    images: row.images ?? [],
    featured: Boolean(row.featured),
    badge: row.badge,
    inStock: row.inStock ?? row.in_stock ?? true,
  };
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  /** Sent as JSON. Omitted for GET/DELETE. */
  body?: Record<string, unknown>;
  /** The customer's Supabase access token. Null when signed out. */
  accessToken?: string | null;
}

/**
 * Call the API and return the parsed JSON.
 *
 * Throws an Error carrying the server's message, so screens can do:
 *   try { ... } catch (e) { setError(e.message) }
 * and show exactly what the server said.
 */
export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = (await response.json().catch(() => null)) as
    | (T & { error?: string })
    | null;

  if (!response.ok) {
    const message =
      data && typeof data.error === 'string' && data.error.length > 0
        ? data.error
        : `Something went wrong (HTTP ${response.status}).`;
    throw new Error(message);
  }

  return data as T;
}

export interface ApiProductsResponse {
  products: Product[];
  count: number;
  /** "database" when Vercel is wired up, "fallback" when it is not. */
  source: 'database' | 'fallback';
}

/**
 * The catalogue through the one shared door.
 *
 * The API comment says it best: the products table is public, so the app
 * could query Supabase directly — but going through here means catalogue
 * rules (hiding unpublished items, tomorrow's sale prices) live in one file.
 */
export async function fetchApiProducts(params: {
  featured?: boolean;
  category?: 'Corporate' | 'Casual';
} = {}): Promise<ApiProductsResponse> {
  const query = new URLSearchParams();
  if (params.featured) query.set('featured', '1');
  if (params.category) query.set('category', params.category);
  const suffix = query.toString() ? `?${query.toString()}` : '';

  const data = await apiFetch<{ products: ApiProduct[]; count: number; source: string }>(
    `/api/products${suffix}`,
  );

  return {
    products: (data.products ?? []).map(toProduct),
    count: data.count ?? 0,
    source: data.source === 'database' ? 'database' : 'fallback',
  };
}
