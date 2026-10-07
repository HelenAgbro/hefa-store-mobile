import type { ImageSourcePropType } from 'react-native';

/**
 * Editorial photographs (lookbook and category imagery), mapped from the
 * website's public paths to bundled files.
 *
 * Same reasoning as src/lib/productImages.ts: the data files store paths like
 * "/images/lookbook-atlantic.jpg", which mean nothing to a phone, and React
 * Native can only load images named literally in code. Adding a new editorial
 * photo means dropping the file in assets/editorial/ and adding one line here.
 */
const IMAGES: Record<string, ImageSourcePropType> = {
  '/images/lookbook-lagos-mornings.jpg': require('../../assets/editorial/lookbook-lagos-mornings.jpg'),
  '/images/lookbook-market-light.jpg': require('../../assets/editorial/lookbook-market-light.jpg'),
  '/images/lookbook-harmattan.jpg': require('../../assets/editorial/lookbook-harmattan.jpg'),
  '/images/lookbook-studio-study.jpg': require('../../assets/editorial/lookbook-studio-study.jpg'),
  '/images/lookbook-atlantic.jpg': require('../../assets/editorial/lookbook-atlantic.jpg'),
  '/images/lookbook-sunday-ease.jpg': require('../../assets/editorial/lookbook-sunday-ease.jpg'),
  '/images/hefa-story.jpg': require('../../assets/editorial/hefa-story.jpg'),
  '/images/category-corporate.jpg': require('../../assets/editorial/category-corporate.jpg'),
  '/images/category-casual.jpg': require('../../assets/editorial/category-casual.jpg'),
};

/** The bundled image for an editorial path, or null when there is no match. */
export function getEditorialImage(path?: string): ImageSourcePropType | null {
  if (!path) return null;
  return IMAGES[path] ?? null;
}
