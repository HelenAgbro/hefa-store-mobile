import { FALLBACK_PRODUCTS } from '@/lib/data/products';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { CategoryName, Product } from '@/lib/types';

/**
 * Product data access.
 *
 * Screens import products from here rather than reaching for Supabase
 * themselves. That keeps the "where does this come from" question in one place,
 * and means swapping the data source later touches only this file.
 *
 * Every function falls back to the offline catalogue (src/lib/data/products.ts)
 * when the database is unavailable, so no screen ever has to handle an empty
 * or failed catalogue — it always gets a usable list.
 */

/** The columns we actually need. Asking for less makes the response smaller. */
const COLUMNS =
  'id, slug, name, price, category, colors, sizes, description, details, swatch, images, featured, badge, in_stock';

/** Map a database row (snake_case) to our Product type (camelCase). */
function rowToProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    price: Number(row.price),
    category: row.category as CategoryName,
    colors: (row.colors as string[]) ?? [],
    sizes: (row.sizes as string[]) ?? [],
    description: String(row.description ?? ''),
    details: (row.details as string[]) ?? [],
    swatch: String(row.swatch ?? '#2f2f2f'),
    images: (row.images as string[]) ?? [],
    featured: Boolean(row.featured),
    badge: row.badge ? String(row.badge) : undefined,
    inStock: Boolean(row.in_stock),
  };
}

/** The catalogue once loaded, kept in memory for the life of the app. */
let cache: Product[] | null = null;

/**
 * The request currently in flight, if any.
 *
 * Two screens can ask for the catalogue at the same moment — the home screen
 * and the shop tab both do. Without this, that would be two identical network
 * requests. Holding the promise means the second caller waits on the first
 * request instead of starting its own.
 */
let inFlight: Promise<Product[]> | null = null;

async function fetchCatalogue(): Promise<Product[] | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.from('products').select(COLUMNS).order('id');

  if (error) {
    console.warn('[products] Supabase error, using offline catalogue:', error.message);
    return null;
  }
  if (!data || data.length === 0) {
    console.warn('[products] Supabase returned no rows, using offline catalogue.');
    return null;
  }

  return (data as unknown as Record<string, unknown>[]).map(rowToProduct);
}

/** The full catalogue. Supabase first, the offline copy as a fallback. */
export async function getAllProducts(): Promise<Product[]> {
  if (cache) return cache;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const fromDatabase = await fetchCatalogue();
    cache = fromDatabase ?? FALLBACK_PRODUCTS;
    inFlight = null;
    return cache;
  })();

  return inFlight;
}

/** One product by its URL slug, for the product screen. */
export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getAllProducts();
  return products.find((product) => product.slug === slug);
}

/** Products flagged for the home screen's Featured row. */
export async function getFeaturedProducts(limit?: number): Promise<Product[]> {
  const featured = (await getAllProducts()).filter((product) => product.featured);
  return limit ? featured.slice(0, limit) : featured;
}

/** Products in one category, for the shop filters. */
export async function getProductsByCategory(category: CategoryName): Promise<Product[]> {
  return (await getAllProducts()).filter((product) => product.category === category);
}

/** Related products: same category first, then the rest of the catalogue. */
export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const others = (await getAllProducts()).filter((item) => item.id !== product.id);
  const sameCategory = others.filter((item) => item.category === product.category);
  const different = others.filter((item) => item.category !== product.category);
  return [...sameCategory, ...different].slice(0, limit);
}

/**
 * Synchronous lookup by id.
 *
 * The cart needs this: it stores product ids, and has to turn them into names
 * and prices while rendering, which cannot wait on a network call. It reads the
 * already-loaded cache, and the offline catalogue before the first load.
 */
export function getProductById(id: string): Product | undefined {
  const products = cache ?? FALLBACK_PRODUCTS;
  return products.find((product) => product.id === id);
}

/** True once the catalogue has been loaded at least once. */
export function isCatalogueLoaded(): boolean {
  return cache !== null;
}

/** Whether the live database is in use, for the home screen's status line. */
export function isUsingDatabase(): boolean {
  return isSupabaseConfigured && cache !== null && cache !== FALLBACK_PRODUCTS;
}
