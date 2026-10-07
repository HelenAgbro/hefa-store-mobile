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
