import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, ErrorNotice } from '@/components/Form';
import { useCart } from '@/context/CartContext';
import { formatNaira } from '@/lib/format';
import { getProductImageSources } from '@/lib/productImages';
import type { CartItem } from '@/lib/cart-api';
import { colors, fonts, spacing } from '@/theme';
const FREE_SHIPPING_AT = 150000;
function LineRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();
  const [img] = getProductImageSources(item.product.images);
  return (
    <View style={rowStyles.row}>
      <View style={[rowStyles.thumb, { backgroundColor: item.product.swatch }]}>
        {img ? <Image source={img} style={rowStyles.thumbImg} contentFit="cover" /> : null}
      </View>
      <View style={rowStyles.info}>
        <Text style={rowStyles.name} numberOfLines={2}>{item.product.name}</Text>
        <Text style={rowStyles.meta}>{item.color} · {item.size}</Text>
        <View style={rowStyles.qtyRow}>
          <Pressable onPress={() => void updateQuantity(item.id, item.quantity - 1)} style={rowStyles.step}><Text style={rowStyles.stepText}>−</Text></Pressable>
          <Text style={rowStyles.qty}>{item.quantity}</Text>
          <Pressable onPress={() => void updateQuantity(item.id, Math.min(10, item.quantity + 1))} style={rowStyles.step}><Text style={rowStyles.stepText}>+</Text></Pressable>
        </View>
      </View>
      <View style={rowStyles.right}>
        <Text style={rowStyles.total}>{formatNaira(item.lineTotal)}</Text>
        <Pressable onPress={() => void removeItem(item.id)}><Text style={rowStyles.remove}>Remove</Text></Pressable>
      </View>
    </View>
  );
}
const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  thumb: { width: 72, height: 90, borderRadius: 8, overflow: 'hidden' },
  thumbImg: { width: '100%', height: '100%' },
  info: { flex: 1, gap: 4 },
  name: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink },
  meta: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  step: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 18, color: colors.ink },
  qty: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.ink, minWidth: 20, textAlign: 'center' },
  right: { alignItems: 'flex-end', justifyContent: 'space-between' },
  total: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink },
  remove: { fontFamily: fonts.sans, fontSize: 12, color: colors.burntOrange },
});
export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, totalItems, subtotal, isLoading, error, isGuest, clear, refresh } = useCart();
  const remaining = Math.max(0, FREE_SHIPPING_AT - subtotal);
  const progress = Math.min(1, subtotal / FREE_SHIPPING_AT);
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 24 }]}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>HEFA</Text>
        <Text style={styles.title}>Bag{totalItems > 0 ? ` (${totalItems})` : ''}</Text>
      </View>
      <ErrorNotice message={error} />
      {items.length === 0 && !isLoading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Your bag is empty</Text>
          <Text style={styles.emptyBody}>Beautiful tailoring is waiting.</Text>
          <Button label="Shop the collection" onPress={() => router.push('/shop')} />
        </View>
      ) : (
        <View style={styles.list}>
          {items.map((item) => (<LineRow key={item.id} item={item} />))}
        </View>
      )}
      {items.length > 0 ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.shipBar}><View style={[styles.shipFill, { flex: progress }]} /><View style={{ flex: 1 - progress }} /></View>
          <Text style={styles.shipText}>{remaining > 0 ? `${formatNaira(remaining)} away from free shipping` : 'Free shipping unlocked'}</Text>
          <View style={styles.totalRow}><Text style={styles.totalLabel}>Subtotal</Text><Text style={styles.totalValue}>{formatNaira(subtotal)}</Text></View>
          {isGuest ? (<Text style={styles.guest}>Guest bag — sign in to sync it.</Text>) : null}
          <Button label="Checkout ›" onPress={() => router.push('/checkout')} isLoading={isLoading} />
          <Pressable onPress={() => { void (async () => { await clear(); await refresh(); })(); }}><Text style={styles.clearText}>Empty bag</Text></Pressable>
        </View>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream, paddingHorizontal: 24 },
  header: { gap: 4, marginBottom: 8 },
  wordmark: { fontFamily: fonts.serif, fontSize: 16, color: colors.ink, letterSpacing: 0.35 },
  title: { fontFamily: fonts.serif, fontSize: 28, color: colors.ink },
  list: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyTitle: { fontFamily: fonts.serif, fontSize: 24, color: colors.ink },
  emptyBody: { fontFamily: fonts.sans, fontSize: 14, color: colors.muted, marginBottom: 12 },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: 12, gap: 8 },
  shipBar: { flexDirection: 'row', height: 4, borderRadius: 2, backgroundColor: colors.border, overflow: 'hidden' },
  shipFill: { backgroundColor: colors.burntOrange, borderRadius: 2 },
  shipText: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  totalLabel: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.12 },
  totalValue: { fontFamily: fonts.serif, fontSize: 24, color: colors.ink },
  guest: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
  clearText: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted, textAlign: 'center', paddingVertical: 8 },
});