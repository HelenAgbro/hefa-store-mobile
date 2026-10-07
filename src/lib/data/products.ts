import type { Product } from '@/lib/types';

/**
 * The offline catalogue.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS IS FOR
 * ---------------------------------------------------------------------------
 * The live catalogue is read from Supabase — the same database the website
 * uses. This copy is what the app shows when the database cannot be reached:
 * no internet, a plane, a tunnel outage, or credentials that have not been set
 * up yet.
 *
 * Without it, a connection problem would leave the customer staring at an empty
 * shop with no explanation. With it, they see products and the app stays useful.
 *
 * ---------------------------------------------------------------------------
 * KEEPING IT IN STEP
 * ---------------------------------------------------------------------------
 * The website keeps the same arrangement, and its copy is the source of truth.
 * When a product is added or a price changes, update it in the database first —
 * that is what customers actually see — then mirror it here so the offline view
 * matches.
 */
export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'hefa-001',
    slug: 'adeola-tailored-trouser',
    name: 'Adeola Tailored Trouser',
    price: 68000,
    category: 'Corporate',
    colors: ['Navy', 'Indigo'],
    sizes: ['30', '32', '34', '36', '38'],
    description:
      'A navy pinstripe wide-leg trouser in a crisp suiting — sharp for the boardroom, easy for every other day.',
    details: ['Pinstripe suiting', 'Wide leg, mid-rise', 'Dry clean only'],
    swatch: '#1f2a44',
    images: ['/images/products/adeola-tailored-trouser-1.jpg'],
    featured: true,
    badge: 'Best seller',
    inStock: true,
  },
  {
    id: 'hefa-002',
    slug: 'ngozi-wide-leg-pant',
    name: 'Ngozi Wide-Leg Pant',
    price: 74000,
    category: 'Casual',
    colors: ['Multicolour', 'Red'],
    sizes: ['30', '32', '34', '36', '38'],
    description:
      'A statement wide-leg in signature Afro-print, finished with patch pockets and a full, flowing hem.',
    details: ['Printed viscose', 'Wide leg, high-rise', 'Machine wash cold'],
    swatch: '#b03a2e',
    images: [
      '/images/products/ngozi-wide-leg-pant-1.jpg',
      '/images/products/ngozi-wide-leg-pant-2.jpg',
      '/images/products/ngozi-wide-leg-pant-3.jpg',
    ],
    featured: true,
    inStock: true,
  },
  {
    id: 'hefa-003',
    slug: 'iwe-pleated-trouser',
    name: 'Ìwé Pleated Trouser',
    price: 76000,
    category: 'Corporate',
    colors: ['Aubergine', 'Plum'],
    sizes: ['30', '32', '34', '36'],
    description:
      'A deep aubergine pleated wide-leg — polished in the office, striking after hours.',
    details: ['Double pleat', 'Wide leg, high-rise', 'Dry clean only'],
    swatch: '#4a2540',
    images: ['/images/products/iwe-pleated-trouser-1.jpg'],
    featured: false,
    inStock: true,
  },
  {
    id: 'hefa-004',
    slug: 'amara-high-waist-pant',
    name: 'Amara High-Waist Pant',
    price: 58000,
    category: 'Casual',
    colors: ['Ochre', 'Mustard'],
    sizes: ['28', '30', '32', '34'],
    description:
      'A relaxed high-waist harem pant in warm mustard — an effortless anchor for weekend dressing.',
    details: ['Printed cotton', 'Elastic high-waist, relaxed leg', 'Machine wash cold'],
    swatch: '#e0a526',
    images: ['/images/products/amara-high-waist-pant-1.jpg'],
    featured: true,
    badge: 'New',
    inStock: true,
  },
  {
    id: 'hefa-005',
    slug: 'zara-cropped-pant',
    name: 'Zara Cropped Pant',
    price: 54000,
    category: 'Casual',
    colors: ['Grey', 'Charcoal'],
    sizes: ['28', '30', '32', '34'],
    description:
      'A cropped tailored trouser in cool grey with an asymmetric wrap panel — made to be worn with loafers.',
    details: ['Wool blend', 'Cropped, tapered leg', 'Dry clean only'],
    swatch: '#6b7280',
    images: ['/images/products/zara-cropped-pant-1.jpg'],
    featured: false,
    inStock: true,
  },
  {
    id: 'hefa-006',
    slug: 'ifeoma-fluid-pant',
    name: 'Ifeoma Fluid Pant',
    price: 62000,
    category: 'Casual',
    colors: ['Cream', 'Ivory'],
    sizes: ['28', '30', '32', '34'],
    description:
      'A soft ivory wide-leg with a clean pleated front — comfort that still holds its shape.',
    details: ['Tencel blend', 'Pleated wide leg, mid-rise', 'Machine wash cold'],
    swatch: '#e9e2d2',
    images: ['/images/products/ifeoma-fluid-pant-1.jpg'],
    featured: true,
    inStock: true,
  },
  {
    id: 'hefa-007',
    slug: 'dami-classic-trouser',
    name: 'Dami Classic Trouser',
    price: 66000,
    category: 'Corporate',
    colors: ['Camel', 'Ochre'],
    sizes: ['30', '32', '34', '36', '38'],
    description:
      'A warm camel pleated trouser — the classic neutral that quietly carries a whole wardrobe.',
    details: ['Wool blend', 'Pleated wide leg', 'Dry clean only'],
    swatch: '#b98b5e',
    images: ['/images/products/dami-classic-trouser-1.jpg'],
    featured: false,
    inStock: true,
  },
  {
    id: 'hefa-008',
    slug: 'kehinde-relaxed-pant',
    name: 'Kehinde Relaxed Pant',
    price: 56000,
    category: 'Casual',
    colors: ['Olive', 'Forest'],
    sizes: ['28', '30', '32', '34', '36'],
    description:
      'A relaxed, easy pant in olive green, balancing comfort with a considered, modern line.',
    details: ['Heavy cotton', 'Relaxed wide leg', 'Machine wash cold'],
    swatch: '#6b7d3a',
    images: ['/images/products/kehinde-relaxed-pant-1.jpg'],
    featured: false,
    inStock: true,
  },
];
