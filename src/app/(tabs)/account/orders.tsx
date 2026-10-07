import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { ErrorNotice } from '@/components/Form';
import { OrderStatusPill } from '@/components/OrderStatusPill';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@/context/AuthContext';
import { fetchOrders } from '@/lib/account-api';
import { formatDate, formatNaira } from '@/lib/format';
import type { Order } from '@/lib/types';
import { colors, fonts, radii, spacing } from '@/theme';

/**
 * Order history.
 *
 * The orders are the customer's own, fetched from GET /api/orders with the
 * signed-in session. The server decides whose orders these are, so there is no
 * id in the request to tamper with — the same protection the website's account
 * area relies on.
 *
 * Prices shown are the ones snapshotted onto each order at purchase time, not
 * the current catalogue price, so history does not change when a product is
 * re-priced.
 */
export default function OrdersScreen() {
  const { accessToken } = useAuth();

  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      if (!accessToken) {
        setOrders([]);
        return;
      }

      setError(null);
      setOrders(null);

      fetchOrders(accessToken)
        .then((result) => {
          if (!cancelled) setOrders(result);
        })
        .catch((e) => {
          if (cancelled) return;
          setError(e instanceof Error ? e.message : 'We could not load your orders.');
          setOrders([]);
        });

      return () => {
        cancelled = true;
      };
    }, [accessToken]),
  );

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Orders" />

      <ScrollView contentContainerStyle={styles.content}>
        <ErrorNotice message={error} />

        {orders === null ? (
          <ActivityIndicator color={colors.burntOrange} style={styles.spinner} />
        ) : orders.length === 0 && !error ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyBody}>
              When you place an order it will appear here, with everything you bought and what you
              paid.
            </Text>
          </View>
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </ScrollView>
    </View>
  );
}

/** One order, with its items and totals. */
function OrderCard({ order }: { order: Order }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardTopText}>
          <Text style={styles.reference}>{order.reference}</Text>
          <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
        </View>
        <OrderStatusPill status={order.status} />
      </View>

      <View style={styles.items}>
        {order.items.map((item, index) => (
          <View key={`${item.productSlug}-${item.size}-${item.color}-${index}`} style={styles.item}>
            <View style={styles.itemText}>
              <Text style={styles.itemName}>{item.productName}</Text>
              <Text style={styles.itemMeta}>
                {[item.color, item.size].filter(Boolean).join(' · ')} · Qty {item.quantity}
              </Text>
            </View>
            <Text style={styles.itemPrice}>{formatNaira(item.lineTotal)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totals}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatNaira(order.total)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  spinner: { marginTop: spacing.xxl },
  empty: {
    marginTop: spacing.xxl,
    gap: spacing.sm,
    alignItems: 'center',
  },
  emptyTitle: { fontFamily: fonts.serif, fontSize: 22, color: colors.ink },
  emptyBody: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: colors.charcoal,
    textAlign: 'center',
    maxWidth: 300,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: '#fbf8f2',
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cardTopText: { gap: 2 },
  reference: { fontFamily: fonts.sansSemiBold, fontSize: 15, color: colors.ink, letterSpacing: 0.04 },
  date: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
  items: { gap: spacing.sm },
  item: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  itemText: { flex: 1, gap: 2 },
  itemName: { fontFamily: fonts.sans, fontSize: 14, color: colors.ink },
  itemMeta: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
  itemPrice: { fontFamily: fonts.sans, fontSize: 13, color: colors.charcoal },
  totals: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.16,
    textTransform: 'uppercase',
  },
  totalValue: { fontFamily: fonts.serif, fontSize: 20, color: colors.ink },
});
