import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { getProductImageSources } from '@/lib/productImages';
import { colors, fonts, radii, spacing } from '@/theme';

/**
 * Full-bleed call-to-action band for the pants line.
 *
 * The forest green stays as the base colour under the photograph, so the band
 * still reads as green if the image is missing, and the scrim carries the
 * contrast for the cream copy rather than relying on the photo being dark.
 */
export function ShopPantsCta() {
  const router = useRouter();
  const image = getProductImageSources(['/images/products/iwe-pleated-trouser-1.jpg'])[0] ?? null;

  return (
    <View style={styles.band}>
      {image ? <Image source={image} style={styles.bg} resizeMode="cover" /> : null}
      <View style={styles.scrim} />

      <View style={styles.inner}>
        <Text style={styles.eyebrow}>The pants line</Text>
        <Text style={styles.title}>
          Shop Pants — tailored trousers designed to be worn everywhere.
        </Text>
        <Text style={styles.body}>
          Eight refined silhouettes in premium fabrics, cut for the Nigerian climate and made to last
          well beyond the season.
        </Text>
        <Pressable
          onPress={() => router.push('/shop')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>Shop the pants line</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    marginTop: spacing.xxxl,
    backgroundColor: colors.forest,
    overflow: 'hidden',
  },
  bg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  inner: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
    gap: spacing.lg,
  },
  eyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.ochre,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 26,
    lineHeight: 32,
    color: colors.cream,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(246,242,234,0.8)',
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.sm,
    backgroundColor: colors.burntOrange,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  buttonText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.cream,
    letterSpacing: 0.14,
    textTransform: 'uppercase',
  },
  pressed: { opacity: 0.85 },
});
