import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, ErrorNotice } from '@/components/Form';
import { useAuth } from '@/context/AuthContext';
import { displayName, fetchOrders, readAddresses, readProfile } from '@/lib/account-api';
import { formatNaira } from '@/lib/format';
import { colors, fonts, radii, spacing } from '@/theme';

/** The rows that lead to the rest of the account area. */
const LINKS = [
  { label: 'Orders', hint: 'Your order history', href: '/account/orders' },
  { label: 'Addresses', hint: 'Delivery addresses', href: '/account/addresses' },
  { label: 'Settings', hint: 'Name and contact details', href: '/account/settings' },
] as const;

/** Statuses that represent money actually received. */
const PAID_STATUSES = ['paid', 'processing', 'shipped', 'delivered'];

/**
 * Account overview.
 *
 * Everything here is the signed-in customer's own data: the name and phone come
 * from their Supabase profile, and the order figures come from GET /api/orders.
 * The website's equivalent page still shows placeholder numbers, so this is
 * currently the more accurate of the two.
 */
export default function AccountOverviewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, accessToken, signOut } = useAuth();

  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [totalSpent, setTotalSpent] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const profile = readProfile(user);
  const addresses = readAddresses(user);

  /**
   * Reload on focus rather than once on mount: a customer who has just paid
   * arrives back here, and the new order should be counted.
   */
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      if (!accessToken) return;

      setError(null);
      fetchOrders(accessToken)
        .then((orders) => {
          if (cancelled) return;
          setOrderCount(orders.length);
          // Only money actually received counts towards "spent" — a pending or
          // abandoned order is not a purchase.
          setTotalSpent(
            orders
              .filter((order) => PAID_STATUSES.includes(order.status))
              .reduce((sum, order) => sum + order.total, 0),
          );
        })
        .catch((e) => {
          if (!cancelled) {
            setError(e instanceof Error ? e.message : 'We could not load your orders.');
          }
        });

      return () => {
        cancelled = true;
      };
    }, [accessToken]),
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.xl }]}
    >
      <View style={styles.header}>
        <Text style={styles.wordmark}>HEFA</Text>
        <Text style={styles.title}>My account</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Signed in as</Text>
        <Text style={styles.cardValue}>{displayName(user)}</Text>
        <Text style={styles.cardMeta}>{user?.email}</Text>
        {profile.phone ? <Text style={styles.cardMeta}>{profile.phone}</Text> : null}
      </View>

      <ErrorNotice message={error} />

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Orders</Text>
          {orderCount === null && !error ? (
            <ActivityIndicator color={colors.burntOrange} style={styles.statSpinner} />
          ) : (
            <Text style={styles.statValue}>{orderCount ?? '—'}</Text>
          )}
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Spent</Text>
          <Text style={styles.statValue}>{formatNaira(totalSpent)}</Text>
        </View>
      </View>

      <View style={styles.links}>
        {LINKS.map((link) => (
          <Pressable
            key={link.href}
            onPress={() => router.push(link.href)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}
          >
            <View style={styles.linkText}>
              <Text style={styles.linkLabel}>{link.label}</Text>
              <Text style={styles.linkHint}>
                {link.href === '/account/addresses' ? `${addresses.length} saved` : link.hint}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>

      <Button label="Sign out" variant="secondary" onPress={() => void signOut()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  header: { gap: spacing.xs, marginBottom: spacing.sm },
  wordmark: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.ink,
    letterSpacing: 0.35,
  },
  title: { fontFamily: fonts.serif, fontSize: 32, color: colors.ink },
  card: {
    padding: spacing.lg,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: '#fbf8f2',
    gap: spacing.xs,
  },
  cardLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.16,
    textTransform: 'uppercase',
  },
  cardValue: { fontFamily: fonts.serif, fontSize: 22, color: colors.ink },
  cardMeta: { fontFamily: fonts.sans, fontSize: 13, color: colors.charcoal },
  stats: { flexDirection: 'row', gap: spacing.md },
  stat: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  statSpinner: { alignSelf: 'flex-start' },
  statLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.16,
    textTransform: 'uppercase',
  },
  statValue: { fontFamily: fonts.serif, fontSize: 24, color: colors.ink },
  links: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  linkPressed: { opacity: 0.6 },
  linkText: { gap: 2 },
  linkLabel: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.ink },
  linkHint: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
  chevron: { fontFamily: fonts.sans, fontSize: 22, color: colors.muted },
});
