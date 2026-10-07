/**
 * One product: gallery, options, and Add to Bag.
 */
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, ErrorNotice } from '@/components/Form';
import { useCart } from '@/context/CartContext';
import { formatNaira } from '@/lib/format';
import { getProductBySlug } from '@/lib/products';
import { getProductImageSources } from '@/lib/productImages';
import type { Product } from '@/lib/types';
import { colors, fonts, radii, spacing } from '@/theme';
export default function ProductScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addItem, isLoading: isSaving } = useCart();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  useEffect(() => {
    let cancelled = false;
    getProductBySlug(slug ?? '').then((found) => {
      if (cancelled) return;
      setProduct(found ?? null);
      setColor(found?.colors[0] ?? null);
      setSize(found?.sizes[0] ?? null);
    }).catch(() => { if (!cancelled) setProduct(null); });
    return () => { cancelled = true; };
  }, [slug]);
  const photos = useMemo(() => (product ? getProductImageSources(product.images) : []), [product]);
  async function handleAdd() {
    if (!product || !color || !size) return;
    setError(null); setAdded(false);
    try {
      await addItem({ productId: product.id, color, size, quantity: qty });
      setAdded(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not add.'); }
  }
  if (product === undefined) {
    return (<View style={[styles.center, { paddingTop: insets.top }]}><ActivityIndicator color={colors.burntOrange} /></View>);
  }
  if (product === null) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.title}>Not found</Text>
        <Text style={styles.body}>That product is no longer available.</Text>
        <Pressable onPress={() => router.back()}><Text style={styles.backText}>Go back</Text></Pressable>
      </View>
    );
  }
  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}>
      <Pressable onPress={() => router.back()} style={[styles.backRow, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.backText}>‹ Back</Text>
      </Pressable>
      <View style={[styles.gallery, { backgroundColor: product.swatch }]}>
        {photos[0] ? (<Image source={photos[0]} style={styles.photo} resizeMode="cover" />) : null}
        {product.badge ? (<View style={styles.badge}><Text style={styles.badgeText}>{product.badge}</Text></View>) : null}
      </View>
      <View style={styles.info}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>{formatNaira(product.price)}</Text>
        <Text style={styles.body}>{product.description}</Text>
        <Text style={styles.label}>Colour</Text>
        <View style={styles.options}>
          {product.colors.map((n) => (
            <Pressable key={n} onPress={() => setColor(n)} style={[styles.option, color === n && styles.optionActive]}>
              <Text style={[styles.optionText, color === n && styles.optionTextActive]}>{n}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>Size</Text>
        <View style={styles.options}>
          {product.sizes.map((n) => (
            <Pressable key={n} onPress={() => setSize(n)} style={[styles.option, size === n && styles.optionActive]}>
              <Text style={[styles.optionText, size === n && styles.optionTextActive]}>{n}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>Quantity</Text>
        <View style={styles.stepper}>
          <Pressable onPress={() => setQty((q) => Math.max(1, q - 1))} style={styles.step}><Text style={styles.stepText}>−</Text></Pressable>
          <Text style={styles.stepCount}>{qty}</Text>
          <Pressable onPress={() => setQty((q) => Math.min(10, q + 1))} style={styles.step}><Text style={styles.stepText}>+</Text></Pressable>
        </View>
        <ErrorNotice message={error} />
        {added ? (<Pressable onPress={() => router.push('/cart')} style={styles.added}><Text style={styles.addedText}>Added — view your bag ›</Text></Pressable>) : null}
        <Button label="Add to bag" onPress={() => void handleAdd()} isLoading={isSaving} />
        {product.details.length > 0 ? (
          <View style={styles.details}>
            {product.details.map((line) => (<Text key={line} style={styles.detail}>· {line}</Text>))}
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  center: { flex: 1, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
  backRow: { paddingHorizontal: 24, paddingBottom: 8 },
  backText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.burntOrange },
  gallery: { marginHorizontal: 24, borderRadius: 8, aspectRatio: 4 / 5, overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  badge: { position: 'absolute', top: 8, left: 8, backgroundColor: colors.cream, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontFamily: fonts.sansMedium, fontSize: 10, color: colors.ink, textTransform: 'uppercase' },
  info: { paddingHorizontal: 24, paddingTop: 16 },
  category: { fontFamily: fonts.sans, fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.16 },
  title: { fontFamily: fonts.serif, fontSize: 28, color: colors.ink, marginTop: 4 },
  price: { fontFamily: fonts.sansMedium, fontSize: 18, color: colors.charcoal, marginTop: 8 },
  body: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.charcoal, marginTop: 12 },
  label: { fontFamily: fonts.sansMedium, fontSize: 11, color: colors.charcoal, textTransform: 'uppercase', letterSpacing: 0.16, marginTop: 20 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  option: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  optionActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  optionText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.charcoal },
  optionTextActive: { color: colors.cream },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 },
  step: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 20, color: colors.ink },
  stepCount: { fontFamily: fonts.sansMedium, fontSize: 16, color: colors.ink, minWidth: 24, textAlign: 'center' },
  added: { marginTop: 12 },
  addedText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.burntOrange },
  details: { marginTop: 16 },
  detail: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted, lineHeight: 20 },
  back: { marginTop: 12 },
});