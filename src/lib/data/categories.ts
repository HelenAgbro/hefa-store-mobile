import type { Category } from '@/lib/types';

/**
 * The two launch categories, copied from the website (web app:
 * src/lib/data/categories.ts). Used by the home screen's category grid.
 */
export const CATEGORIES: Category[] = [
  {
    slug: 'corporate',
    name: 'Corporate',
    description: 'Sharp, tailored trousers for the office and beyond.',
    swatch: '#2f2f2f',
    image: '/images/category-corporate.jpg',
  },
  {
    slug: 'casual',
    name: 'Casual',
    description: 'Relaxed, elevated pants for the weekend.',
    swatch: '#b4551f',
    image: '/images/category-casual.jpg',
  },
];
