/**
 * The shop: the full catalogue in a two-column grid.
 *
 * ---------------------------------------------------------------------------
 * WHERE THE PRODUCTS COME FROM
 * ---------------------------------------------------------------------------
 * The API first (GET /api/products) — the one shared door the web app's own
 * comment describes. The Supabase-direct catalogue is the fallback, so the
 * shop still works when Vercel is unreachable or misconfigured; the footnote
 * says honestly which one is showing.
 *
 * ---------------------------------------------------------------------------
 * WHY useFocusEffect, NOT useEffect
 * ---------------------------------------------------------------------------
 * The home screen loads once. The shop reloads every time it is focused —
 * add to bag on a product screen, come back, and the grid reflects the
 * current catalogue rather than a stale copy.
 */

import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorNotice } from '@/components/Form';
import { ProductCard } from '@/components/ProductCard';
import { fetchApiProducts } from '@/lib/api';
import { getAllProducts } from '@/lib/products';
import type { CategoryName, Product } from '@/lib/types';
import { colors, fonts, radii, spacing } from '@/theme';

type Filter = 'All' | CategoryName;
const FILTERS: Filter[] = ['All', 'Corporate', 'Casual'];

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const router = useRouter();

  const [filter, setFilter] = useState<Filter>('All');
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'api' | 'database' | 'offline'>('api');

  // Two columns with page padding and a gutter between them.
  const cardWidth = Math.floor((screenWidth - spacing.xl * 2 - spacing.lg) / 2);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchApiProducts();
      setProducts(data.products);
      // The API reports database vs fallback; the footnote shows it.
      setSource(data.source === 'database' ? 'api' : 'offline');
    } catch (e) {
      try {
        setProducts(await getAllProducts());
        setSource('database');
      } catch {
        setError(e instanceof Error ? e.message : 'We could not load the collection.');
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const visible =
    products === null ? [] : filter === 'All' ? products : products.filter((p) => p.category === filter);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.xl }]}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>HEFA</Text>
        <Text style={styles.title}>Shop</Text>
      </View>

      <View style={styles.filters}>
        {FILTERS.map((name) => (
          <Pressable
            key={name}
            onPress={() => setFilter(name)}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === name }}
            style={[styles.chip, filter === name && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === name && styles.chipTextActive]}>{name}</Text>
          </Pressable>
        ))}
      </View>

      {products === null && !error ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.burntOrange} />
          <Text style={styles.loadingText}>Loading the collection…</Text>
        </View>
      ) : error ? (
        <View style={styles.error}>
          <ErrorNotice message={error} />
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.xxxl }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              width={cardWidth}
              onPress={() => router.push(`/product/${item.slug}`)}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>Nothing in {filter} yet — try another filter.</Text>
          }
          ListFooterComponent={
            <Text style={styles.footnote}>
              {source === 'api'
                ? 'Catalogue: live from the HEFA API'
                : source === 'database'
                  ? 'Catalogue: live from Supabase'
                  : 'Catalogue: offline copy (API not reachable)'}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    paddingHorizontal: spacing.xl,
    gap: spacing.xs,
  },
  wordmark: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.ink,
    letterSpacing: 0.35,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.ink,
  },
  filters: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: '#fbf8f2',
  },
  chipActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  chipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.charcoal,
    letterSpacing: 0.1,
    textTransform: 'uppercase',
  },
  chipTextActive: {
    color: colors.cream,
  },
  list: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  row: {
    gap: spacing.lg,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.muted,
  },
  error: {
    paddingHorizontal: spacing.xl,
  },
  empty: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: spacing.xxxl,
  },
  footnote: {
    marginTop: spacing.xl,
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.06,
    textAlign: 'center',
  },
});

