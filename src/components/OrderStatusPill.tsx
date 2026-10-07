import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radii } from '@/theme';
import type { OrderStatus } from '@/lib/types';

/**
 * The pill that says where an order is.
 *
 * The database stores lowercase values ('pending', 'paid'…). This is the one
 * place that turns them into words a customer reads, so the label and the
 * colour always agree — the website has an equivalent component, and the two
 * share the same vocabulary even though they render differently.
 */

const LABELS: Record<OrderStatus, string> = {
  pending: 'Awaiting payment',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

/** Warm = still in flight, green = good news, grey = done, orange = problem. */
const TONES: Record<OrderStatus, string> = {
  pending: colors.ochre,
  paid: colors.forest,
  processing: colors.ochre,
  shipped: colors.forest,
  delivered: colors.charcoal,
  cancelled: colors.burntOrange,
  refunded: colors.muted,
};

export function OrderStatusPill({ status }: { status: OrderStatus }) {
  const tone = TONES[status] ?? colors.muted;

  return (
    <View style={[styles.pill, { borderColor: tone }]}>
      <Text style={[styles.text, { color: tone }]}>{LABELS[status] ?? status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 0.14,
    textTransform: 'uppercase',
  },
});
