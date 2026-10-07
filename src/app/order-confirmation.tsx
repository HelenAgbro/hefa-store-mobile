import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Form';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { confirmOrder } from '@/lib/checkout-api';
import { formatNaira } from '@/lib/format';
import type { Order } from '@/lib/types';
import { colors, fonts, radii, spacing } from '@/theme';

/**
 * Order confirmation — the receipt after paying.
 *
 * The checkout screen hands off here with the order reference and the token
 * Paystack returned with. This screen asks the server to confirm the payment
 * (the server is the only thing that decides an order is paid) and then shows
 * the order it gets back. Because the token travels with the link, this works
 * for guests as well as signed-in customers.
 */

export default function OrderConfirmationScreen() {
  const { reference, token } = useLocalSearchParams<{ reference?: string; token?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { clear } = useCart();

  const [phase, setPhase] = useState<'loading' | 'ready' | 'error'>('loading');
  const [status, setStatus] = useState('unknown');
  const [message, setMessage] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Guard so confirmation runs once. The server call is idempotent, but clearing
   * the bag twice would be wasteful, and this keeps a re-render from re-asking.
   */
  const hasConfirmed = useRef(false);

  useEffect(() => {
    if (hasConfirmed.current) return;
    hasConfirmed.current = true;

    if (!reference || !token) {
      setError('We could not find that order.');
      setPhase('error');
      return;
    }

    confirmOrder(reference, token)
      .then((result) => {
        setStatus(result.status);
        setMessage(result.message ?? null);
        setOrder(result.order ?? null);
        setPhase('ready');
        // A paid order means the bag is done with. Clearing it here keeps
        // "the order is paid" in one place rather than two.
        if (result.status === 'paid') clear();
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'We could not confirm your payment.');
        setPhase('error');
      });
  }, [reference, token, clear]);

  const isPaid = status === 'paid' || status === 'success';
  const isPending = status === 'processing' || status === 'pending';
  const isFailed = status === 'failed' || status === 'abandoned';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xxxl },
      ]}
    >
      {phase === 'loading' ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.burntOrange} />
          <Text style={styles.centeredText}>Confirming your payment…</Text>
        </View>
      ) : phase === 'error' ? (
        <View style={styles.block}>
          <Text style={styles.eyebrow}>Order</Text>
          <Text style={styles.title}>We could not confirm this order</Text>
          <Text style={styles.body}>{error}</Text>
          <View style={styles.actions}>
            <Button label="Continue shopping" onPress={() => router.replace('/shop')} />
            {user ? (
              <Button
                label="View your orders"
                variant="secondary"
                onPress={() => router.replace('/account/orders')}
              />
            ) : null}
          </View>
        </View>
      ) : (
        <View style={styles.block}>
          <Text style={styles.eyebrow}>{isPaid ? 'Thank you' : 'Order status'}</Text>
          <Text style={styles.title}>
            {isPaid
              ? 'Payment received'
              : isPending
                ? 'Payment processing'
                : isFailed
                  ? 'Payment not completed'
                  : 'Payment not confirmed'}
          </Text>
          <Text style={styles.body}>
            {message ??
              (isPaid
                ? 'Your order is confirmed and a receipt is on its way to your inbox.'
                : isPending
                  ? 'We are waiting for the payment to settle. Check back shortly for the latest.'
                  : isFailed
                    ? 'The payment did not go through, so nothing was charged. You can try again from the checkout.'
                    : 'We have not been able to confirm the payment yet. If you were charged, message us with the reference below.')}
          </Text>

          {order ? <Receipt order={order} /> : null}

          <View style={styles.actions}>
            {isFailed ? (
              <Button label="Try again" onPress={() => router.replace('/checkout')} />
            ) : null}
            <Button
              label="Continue shopping"
              variant={isFailed ? 'secondary' : 'primary'}
              onPress={() => router.replace('/shop')}
            />
            {user ? (
              <Button
                label="View your orders"
                variant="secondary"
                onPress={() => router.replace('/account/orders')}
              />
            ) : null}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function Receipt({ order }: { order: Order }) {
  return (
    <View style={styles.receipt}>
      <View style={styles.meta}>
        <Row label="Reference" value={order.reference} />
        <Row label="Status" value={order.status} />
        <Row label="Shipping" value={order.shippingLabel} />
        <Row
          label="Delivering to"
          value={[order.address1, order.address2].filter(Boolean).join(', ')}
        />
        <Row
          label="City"
          value={[[order.city, order.region].filter(Boolean).join(', '), order.country]
            .filter(Boolean)
            .join(' · ')}
        />
      </View>

      <View style={styles.items}>
        {order.items.map((item, index) => (
          <View key={`${item.productId}-${index}`} style={styles.item}>
            <View style={styles.itemMain}>
              <Text style={styles.itemName}>{item.productName}</Text>
              <Text style={styles.itemMeta}>
                {[item.color, item.size, `×${item.quantity}`].filter(Boolean).join(' · ')}
              </Text>
            </View>
            <Text style={styles.itemPrice}>{formatNaira(item.lineTotal)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totals}>
        <Row label="Subtotal" value={formatNaira(order.subtotal)} />
        <Row label="Shipping" value={order.shipping === 0 ? 'Free' : formatNaira(order.shipping)} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatNaira(order.total)}</Text>
        </View>
      </View>
    </View>
  );
}

/** A label/value line, used for the order meta and the money summary. */
function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: spacing.xl, gap: spacing.xl },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingTop: spacing.xxxl,
  },
  centeredText: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted },
  block: { gap: spacing.md },
  eyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.burntOrange,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  title: { fontFamily: fonts.serif, fontSize: 34, color: colors.ink },
  body: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.charcoal },
  actions: { gap: spacing.md, marginTop: spacing.lg },
  receipt: {
    marginTop: spacing.lg,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: '#fbf8f2',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  meta: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: spacing.lg,
  },
  rowLabel: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.12,
  },
  rowValue: {
    flex: 1,
    textAlign: 'right',
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.ink,
  },
  items: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  item: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.lg },
  itemMain: { flex: 1, gap: 2 },
  itemName: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink },
  itemMeta: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
  itemPrice: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  totals: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
    gap: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: spacing.xs,
  },
  totalLabel: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.12,
  },
  totalValue: { fontFamily: fonts.serif, fontSize: 24, color: colors.ink },
});
