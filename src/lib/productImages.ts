import type { ImageSourcePropType } from 'react-native';

/**
 * Turns the database's photo paths into images the phone can actually show.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 * ---------------------------------------------------------------------------
 * The database stores each photo as a text path, e.g.
 *
 *     "/images/products/adeola-tailored-trouser-1.jpg"
 *
 * On a website that resolves against the site's own domain. On a phone there is
 * no such domain, so the path on its own points at nothing.
 *
 * React Native also refuses to load images by a computed string — every image
 * must be named literally in the code, so the build tool can find the file and
 * bundle it. That is why this is a written-out list rather than a loop.
 *
 * ---------------------------------------------------------------------------
 * ADDING A NEW PHOTO
 * ---------------------------------------------------------------------------
 *   1. Save it in assets/products/ as <slug>-<n>.jpg
 *   2. Add one line below, left side exactly as the database stores it
 * Nothing else needs changing — the shop, home and product screens all read
 * through getProductImageSources().
 */

const IMAGES: Record<string, ImageSourcePropType> = {
  '/images/products/adeola-tailored-trouser-1.jpg': require('../../assets/products/adeola-tailored-trouser-1.jpg'),
  '/images/products/amara-high-waist-pant-1.jpg': require('../../assets/products/amara-high-waist-pant-1.jpg'),
  '/images/products/dami-classic-trouser-1.jpg': require('../../assets/products/dami-classic-trouser-1.jpg'),
  '/images/products/ifeoma-fluid-pant-1.jpg': require('../../assets/products/ifeoma-fluid-pant-1.jpg'),
  '/images/products/iwe-pleated-trouser-1.jpg': require('../../assets/products/iwe-pleated-trouser-1.jpg'),
  '/images/products/kehinde-relaxed-pant-1.jpg': require('../../assets/products/kehinde-relaxed-pant-1.jpg'),
  '/images/products/ngozi-wide-leg-pant-1.jpg': require('../../assets/products/ngozi-wide-leg-pant-1.jpg'),
  '/images/products/ngozi-wide-leg-pant-2.jpg': require('../../assets/products/ngozi-wide-leg-pant-2.jpg'),
  '/images/products/ngozi-wide-leg-pant-3.jpg': require('../../assets/products/ngozi-wide-leg-pant-3.jpg'),
  '/images/products/zara-cropped-pant-1.jpg': require('../../assets/products/zara-cropped-pant-1.jpg'),
};

/**
 * The local photos for a product, in the order the database listed them.
 *
 * A path with no matching file is skipped rather than crashing. That is
 * deliberate: adding a product to the database before its photo has been added
 * to the app should show the colour swatch, not break the shop. It also means
 * a renamed file degrades quietly instead of taking the screen down.
 */
export function getProductImageSources(imagePaths: string[]): ImageSourcePropType[] {
  return imagePaths
    .map((path) => IMAGES[path])
    .filter((image): image is ImageSourcePropType => image !== undefined);
}
