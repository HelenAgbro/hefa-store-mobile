import type { CategoryName, Product } from '@/lib/types';

/**
 * Shop filtering and sorting, copied from the website (web app: src/lib/shop.ts).
 *
 * Pure functions, kept separate from the screen so the same rules the website
 * applies to its catalogue apply here — a customer who filters by size 32 on
 * the site sees the same pieces on the phone.
 */

/** The sort orders available in the shop. */
export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

/** Hex values used to render the colour-filter swatches. */
export const COLOR_SWATCHES: Record<string, string> = {
  Black: '#0b0b0b',
  Charcoal: '#2f2f2f',
  Forest: '#1e3a2f',
  Ochre: '#b8860b',
  Cream: '#e9e2d2',
  'Burnt Orange': '#b4551f',
};

export interface ProductFilters {
  category: CategoryName | 'all';
  size: string | null;
  color: string | null;
}

/** Apply the category, size and colour filters. Pure — does not mutate the input. */
export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  return products.filter((product) => {
    if (filters.category !== 'all' && product.category !== filters.category) return false;
    if (filters.size && !product.sizes.includes(filters.size)) return false;
    if (filters.color && !product.colors.includes(filters.color)) return false;
    return true;
  });
}

/** Sort a copy of the list by the chosen order. */
export function sortProducts(products: Product[], sort: SortKey): Product[] {
  const sorted = [...products];

  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'featured':
    default:
      // Featured items first, then the original catalogue order.
      return sorted.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }
}

/** Derive the filter options (in a sensible order) from the catalogue. */
export function getFilterOptions(products: Product[]): {
  categories: CategoryName[];
  sizes: string[];
  colors: string[];
} {
  const categories = Array.from(new Set(products.map((product) => product.category)));
  const sizes = Array.from(new Set(products.flatMap((product) => product.sizes))).sort(
    (a, b) => Number(a) - Number(b),
  );
  const colors = Array.from(new Set(products.flatMap((product) => product.colors))).sort((a, b) =>
    a.localeCompare(b),
  );

  return { categories, sizes, colors };
}
