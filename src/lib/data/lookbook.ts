import type { LookbookEntry } from '@/lib/types';

/**
 * Lookbook entries, copied from the website (web app: src/lib/data/lookbook.ts).
 *
 * `swatch` is the fallback for any entry without a photograph, so the colour
 * stays as the last line of defence rather than the first.
 */
export const LOOKBOOK: LookbookEntry[] = [
  {
    id: 'lb-1',
    title: 'Lagos Mornings',
    caption: 'Corporate · AW25',
    swatch: '#2f2f2f',
    image: '/images/lookbook-lagos-mornings.jpg',
  },
  {
    id: 'lb-2',
    title: 'Market Light',
    caption: 'Casual · AW25',
    swatch: '#b8860b',
    image: '/images/lookbook-market-light.jpg',
  },
  {
    id: 'lb-3',
    title: 'Harmattan',
    caption: 'Corporate · AW25',
    swatch: '#1e3a2f',
    image: '/images/lookbook-harmattan.jpg',
  },
  {
    id: 'lb-4',
    title: 'Studio Study',
    caption: 'Casual · AW25',
    swatch: '#b4551f',
    image: '/images/lookbook-studio-study.jpg',
  },
  {
    id: 'lb-5',
    title: 'Atlantic',
    caption: 'Corporate · AW25',
    swatch: '#0b0b0b',
    image: '/images/lookbook-atlantic.jpg',
  },
  {
    id: 'lb-6',
    title: 'Sunday Ease',
    caption: 'Casual · AW25',
    swatch: '#7a6a4f',
    image: '/images/lookbook-sunday-ease.jpg',
  },
];
