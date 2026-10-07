import type { ReactNode } from 'react';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
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
import {
  COLOR_SWATCHES,
  SORT_OPTIONS,
  filterProducts,
  getFilterOptions,
  sortProducts,
  type SortKey,
} from '@/lib/shop';
import type { CategoryName, Product } from '@/lib/types';
import { colors, fonts, radii, spacing } from '@/theme';

/**
 * The shop: the full catalogue in a two-column grid, with the same category,
 * size, colour and sort controls the website offers.
 *
 * Products come from the API first (GET /api/products); the Supabase-direct
 * catalogue is the fallback, and the footnote says honestly which is showing.
 * The grid reloads on focus, so a bag change on a product screen is reflected
 * when the customer comes back.
 */

type CategoryFilter = CategoryName | 'all';

/** One tappable filter chip. */
function Pill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

/** A labelled row of chips that scrolls sideways when it overflows. */
function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.filterRow}>
      <Text style={styles.filterLabel}>{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChips}
      >
        {children}
      </ScrollView>
    </View>
  );
}

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const router = useRouter();

  const [category, setCategory] = useState<CategoryFilter>('all');
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>('featured');

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

  const options = getFilterOptions(products ?? []);
  const visible = products
    ? sortProducts(filterProducts(products, { category, size, color }), sort)
    : [];

  const hasActiveFilters = category !== 'all' || size !== null || color !== null;

  function clearFilters() {
    setCategory('all');
    setSize(null);
    setColor(null);
  }

  /** The filter + sort panel, rendered above the grid so it scrolls with it. */
  const header = (
    <View style={styles.panel}>
      <View style={styles.countRow}>
        <Text style={styles.count}>
          {visible.length} {visible.length === 1 ? 'piece' : 'pieces'}
        </Text>
        {hasActiveFilters ? (
          <Pressable onPress={clearFilters} accessibilityRole="button" hitSlop={8}>
            <Text style={styles.clear}>Clear</Text>
          </Pressable>
        ) : null}
      </View>

      <FilterRow label="Category">
        <Pill label="All" active={category === 'all'} onPress={() => setCategory('all')} />
        {options.categories.map((name) => (
          <Pill
            key={name}
            label={name}
            active={category === name}
            onPress={() => setCategory(category === name ? 'all' : name)}
          />
        ))}
      </FilterRow>

      <FilterRow label="Size">
        {options.sizes.map((value) => (
          <Pill
            key={value}
            label={value}
            active={size === value}
            onPress={() => setSize(size === value ? null : value)}
          />
        ))}
      </FilterRow>

      <FilterRow label="Colour">
        {options.colors.map((name) => {
          const active = color === name;
          return (
            <Pressable
              key={name}
              onPress={() => setColor(active ? null : name)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[styles.chip, styles.swatchChip, active && styles.chipActive]}
            >
              <View style={[styles.swatch, { backgroundColor: COLOR_SWATCHES[name] ?? '#b9b2a4' }]} />
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{name}</Text>
            </Pressable>
          );
        })}
      </FilterRow>

      <FilterRow label="Sort">
        {SORT_OPTIONS.map((option) => (
          <Pill
            key={option.value}
            label={option.label}
            active={sort === option.value}
            onPress={() => setSort(option.value)}
          />
        ))}
      </FilterRow>
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.xl }]}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>HEFA</Text>
        <Text style={styles.title}>Shop</Text>
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
          ListHeaderComponent={header}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              width={cardWidth}
              onPress={() => router.push(`/product/${item.slug}`)}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>Nothing matches those filters — try clearing one.</Text>
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
  panel: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  count: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.16,
    textTransform: 'uppercase',
  },
  clear: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.burntOrange,
    letterSpacing: 0.16,
    textTransform: 'uppercase',
    textDecorationLine: 'underline',
  },
  filterRow: { gap: spacing.sm },
  filterLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  filterChips: { gap: spacing.sm, paddingRight: spacing.xl },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: '#fbf8f2',
  },
  swatchChip: { paddingRight: spacing.md },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.2)',
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
