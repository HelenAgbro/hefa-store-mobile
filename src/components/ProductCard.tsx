import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatNaira } from '@/lib/format';
import { getProductImageSources } from '@/lib/productImages';
import type { Product } from '@/lib/types';
import { colors, fonts, IMAGE_ASPECT, radii, spacing } from '@/theme';

/**
 * One product in a grid: photo, name and price.
 *
 * Used by the home screen's Featured row and, later, the shop grid, so the two
 * stay identical by construction rather than by remembering to edit both.
 */

interface ProductCardProps {
  product: Product;
  /** Fixed width, because a horizontally-scrolling row cannot use percentages. */
  width: number;
  onPress?: () => void;
}

export function ProductCard({ product, width, onPress }: ProductCardProps) {
  /**
   * The first photo, or undefined when the app has no bundled file for this
   * product. Undefined is not an error — see the swatch fallback below.
   */
  const [image] = getProductImageSources(product.images);

  const soldOut = !product.inStock;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${product.name}, ${formatNaira(product.price)}`}
      style={({ pressed }) => [{ width }, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.imageFrame,
          /**
           * The product's own swatch colour sits behind the photo. While the
           * image decodes, and for any product with no photo at all, this shows
           * instead of a white gap — so the grid never looks broken.
           */
          { backgroundColor: product.swatch },
        ]}
      >
        {image ? (
          <Image
            source={image}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
            accessibilityIgnoresInvertColors
          />
        ) : null}

        {product.badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{product.badge}</Text>
          </View>
        ) : null}

        {soldOut ? (
          <View style={styles.soldOut}>
            <Text style={styles.soldOutText}>Sold out</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.name} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={styles.price}>{formatNaira(product.price)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.7,
  },
  imageFrame: {
    width: '100%',
    aspectRatio: IMAGE_ASPECT,
    borderRadius: radii.md,
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.cream,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  badgeText: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: colors.ink,
    letterSpacing: 0.1,
    textTransform: 'uppercase',
  },
  soldOut: {
    /**
     * Written out rather than spread from a helper, because the name of the
     * helper changed in React Native 0.86 and this works on any version.
     */
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 11, 11, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOutText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.onDark,
    letterSpacing: 0.16,
    textTransform: 'uppercase',
  },
  name: {
    marginTop: spacing.md,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },
  price: {
    marginTop: spacing.xs,
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.charcoal,
  },
});
