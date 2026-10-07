import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { AnnouncementBar } from '@/components/home/AnnouncementBar';
import { BrandStory } from '@/components/home/BrandStory';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { LookbookPreview } from '@/components/home/LookbookPreview';
import { Newsletter } from '@/components/home/Newsletter';
import { ShopPantsCta } from '@/components/home/ShopPantsCta';
import { ProductCard } from '@/components/ProductCard';
import { getFeaturedProducts, isUsingDatabase } from '@/lib/products';
import type { Product } from '@/lib/types';
import { colors, fonts, radii, spacing } from '@/theme';

/**
 * HEFA home screen.
 *
 * The brand hero, followed by the products the studio has flagged as featured
 * in the database — the same ones the website's homepage shows.
 */
/** Help and policy links shown at the foot of the home screen. */
const HELP_LINKS = [
  { label: 'Lookbook', href: '/lookbook' },
  { label: 'About HEFA', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Shipping & Returns', href: '/shipping-returns' },
  { label: 'Contact', href: '/contact' },
] as const;

export default function HomeScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const router = useRouter();

  /**
   * Roughly 58% of the screen width, so the next card peeks in at the edge and
   * it is obvious the row scrolls sideways. A full-width card would look
   * finished, and nobody would think to swipe it.
   */
  const cardWidth = Math.round(screenWidth * 0.58);

  const [featured, setFeatured] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load the catalogue.
   *
   * `cancelled` guards against setting state after the screen has gone away,
   * which would warn in development and is a real leak on a slow connection —
   * the customer can navigate away long before the request finishes.
   */
  useEffect(() => {
    let cancelled = false;

    getFeaturedProducts(6)
      .then((products) => {
        if (cancelled) return;
        setFeatured(products);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const openProduct = useCallback(
    (product: Product) => {
      router.push(`/product/${product.slug}`);
    },
    [router],
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      <AnnouncementBar />

      <View style={styles.header}>
        <Text style={styles.wordmark}>HEFA</Text>
        <Text style={styles.tagline}>Modern Nigerian tailoring</Text>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>AW25</Text>
        <Text style={styles.heroTitle}>Tailored{'\n'}for the{'\n'}modern wardrobe</Text>
        <Text style={styles.heroBody}>
          Premium Nigerian designer label, crafted in Lagos.
        </Text>
        <View style={styles.heroActions}>
          <Pressable
            onPress={() => router.push('/shop')}
            accessibilityRole="button"
            style={styles.heroPrimary}
          >
            <Text style={styles.heroPrimaryText}>Shop the collection</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/lookbook')}
            accessibilityRole="button"
            style={styles.heroSecondary}
          >
            <Text style={styles.heroSecondaryText}>View lookbook</Text>
          </Pressable>
        </View>
      </View>

      <ShopPantsCta />
      <CategoryGrid />

      <View style={styles.section}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>Featured</Text>
          <Text style={styles.sectionMeta}>The collection</Text>
        </View>

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.burntOrange} />
            <Text style={styles.loadingText}>Loading the collection…</Text>
          </View>
        ) : (
          /**
           * horizontal + no scroll indicator: the peek of the next card is what
           * signals the row scrolls, so a scrollbar would only add noise.
           */
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.row}
            snapToInterval={cardWidth + spacing.lg}
            decelerationRate="fast"
          >
            {featured.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                width={cardWidth}
                onPress={() => openProduct(product)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <BrandStory />
      <LookbookPreview />
      <Newsletter />

      <View style={styles.help}>
        <Text style={styles.helpTitle}>Help &amp; info</Text>
        {HELP_LINKS.map((link) => (
          <Pressable
            key={link.href}
            onPress={() => router.push(link.href)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.helpLink, pressed && styles.helpLinkPressed]}
          >
            <Text style={styles.helpLinkLabel}>{link.label}</Text>
            <Text style={styles.helpChevron}>›</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.footnote}>
        {isUsingDatabase()
          ? 'Catalogue: live from Supabase'
          : 'Catalogue: offline copy (database not reachable)'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  wordmark: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.ink,
    /**
     * Wide letter spacing on the wordmark is the brand's signature — the same
     * 0.35em tracking the website uses on its logo.
     */
    letterSpacing: 0.35,
  },
  tagline: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.18,
    textTransform: 'uppercase',
  },
  hero: {
    marginTop: spacing.xxxl,
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  heroEyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.burntOrange,
    letterSpacing: 0.22,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: fonts.serif,
    fontSize: 40,
    lineHeight: 46,
    color: colors.ink,
    letterSpacing: -0.01,
  },
  heroBody: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 24,
    color: colors.charcoal,
  },
  heroActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  heroPrimary: {
    backgroundColor: colors.ink,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPrimaryText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.cream,
    letterSpacing: 0.14,
    textTransform: 'uppercase',
  },
  heroSecondary: {
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.charcoal,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSecondaryText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.ink,
    letterSpacing: 0.14,
    textTransform: 'uppercase',
  },
  section: {
    marginTop: spacing.xxxl,
    gap: spacing.lg,
  },
  sectionHeading: {
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.ink,
  },
  sectionMeta: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.16,
    textTransform: 'uppercase',
  },
  loading: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.muted,
  },
  row: {
    /** Leading padding lives here so the first card is not flush to the edge. */
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  help: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  helpTitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    paddingTop: spacing.lg,
  },
  helpLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  helpLinkPressed: { opacity: 0.6 },
  helpLinkLabel: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.ink },
  helpChevron: { fontFamily: fonts.sans, fontSize: 22, color: colors.muted },
  footnote: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.06,
    textAlign: 'center',
  },
});
