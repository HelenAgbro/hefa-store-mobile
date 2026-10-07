import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { CATEGORIES } from '@/lib/data/categories';
import { getEditorialImage } from '@/lib/editorialImages';
import { colors, fonts, radii, spacing } from '@/theme';

/**
 * "Corporate" and "Casual" category cards linking into the shop.
 *
 * The swatch stays underneath each card as the fallback, so a category without
 * a photograph still renders as a colour block rather than an empty frame.
 */
export function CategoryGrid() {
  const router = useRouter();

  return (
    <View style={styles.section}>
      <Text style={styles.eyebrow}>Shop by category</Text>
      <Text style={styles.title}>Two wardrobes, one standard of craft</Text>
      <Text style={styles.lede}>
        Start with sharp tailoring for work or relaxed pants for the weekend. Both are cut to the
        same exacting standard.
      </Text>

      <View style={styles.grid}>
        {CATEGORIES.map((category) => {
          const image = getEditorialImage(category.image);
          return (
            <Pressable
              key={category.slug}
              onPress={() => router.push('/shop')}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: category.swatch },
                pressed && styles.pressed,
              ]}
            >
              {image ? <Image source={image} style={styles.bg} resizeMode="cover" /> : null}
              <View style={styles.scrim} />
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{category.name}</Text>
                <Text style={styles.cardText}>{category.description}</Text>
                <Text style={styles.cardCta}>Shop {category.name} →</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.xxxl, paddingHorizontal: spacing.xl, gap: spacing.md },
  eyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.burntOrange,
    letterSpacing: 0.22,
    textTransform: 'uppercase',
  },
  title: { fontFamily: fonts.serif, fontSize: 26, color: colors.ink },
  lede: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.charcoal },
  grid: { gap: spacing.lg, marginTop: spacing.sm },
  card: {
    aspectRatio: 3 / 4,
    borderRadius: radii.md,
    overflow: 'hidden',
    justifyContent: 'flex-end',
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
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  cardBody: { padding: spacing.xl, gap: spacing.sm },
  cardTitle: { fontFamily: fonts.serif, fontSize: 26, color: colors.onDark },
  cardText: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: 'rgba(255,255,255,0.85)' },
  cardCta: {
    marginTop: spacing.sm,
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.cream,
    letterSpacing: 0.18,
    textTransform: 'uppercase',
  },
  pressed: { opacity: 0.9 },
});
