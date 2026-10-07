import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FREE_SHIPPING_THRESHOLD, SHIPPING_METHODS } from '@/lib/checkout';
import { formatNaira } from '@/lib/format';
import { colors, fonts, radii, spacing } from '@/theme';

/**
 * Shipping & returns — the same policy as the website.
 *
 * The costs and timelines come straight from src/lib/checkout.ts, the module
 * the checkout screen also prices with. Reading them from there rather than
 * retyping them is what stops this page promising one price while the checkout
 * charges another.
 */

const RETURN_STEPS = [
  {
    title: 'Request a return',
    body: 'Message us within 14 days of delivery with your order reference and the reason for the return.',
  },
  {
    title: 'Pack it as you received it',
    body: 'Items should be unworn, unwashed and have their tags attached. Try things on over your own clothing, not directly against skin.',
  },
  {
    title: 'Send it back',
    body: 'Our first return delivery within Nigeria is free. We share collection instructions once your return is approved.',
  },
  {
    title: 'Refund or exchange',
    body: 'After inspection we issue a refund within 5–7 business days, or exchange for another size if stock allows.',
  },
];

export default function ShippingReturnsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.eyebrow}>Policies</Text>
        <Text style={styles.title}>Shipping &amp; Returns</Text>
        <Text style={styles.lede}>
          Everything about delivery, returns and exchanges — written plainly, without the small
          print games.
        </Text>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupEyebrow}>Shipping</Text>
        <Text style={styles.groupTitle}>Options and timelines</Text>

        <View style={styles.table}>
          {SHIPPING_METHODS.map((method) => (
            <View key={method.id} style={styles.row}>
              <View style={styles.rowMain}>
                <Text style={styles.methodLabel}>{method.label}</Text>
                <Text style={styles.methodMeta}>{method.description}</Text>
              </View>
              <Text style={styles.methodCost}>
                {method.price === 0 ? 'Free' : formatNaira(method.price)}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.body}>
          Standard delivery within Nigeria is free on orders over{' '}
          {formatNaira(FREE_SHIPPING_THRESHOLD)}. Studio pickup is available in Lagos only.
        </Text>

        <View style={styles.twoUp}>
          <View style={styles.twoUpItem}>
            <Text style={styles.subTitle}>Nigeria</Text>
            <Text style={styles.body}>
              We deliver nationwide, including Lagos, Abuja, Port Harcourt, Kano, Ibadan and Enugu.
              Orders placed before 2pm on a business day ship the same day.
            </Text>
          </View>
          <View style={styles.twoUpItem}>
            <Text style={styles.subTitle}>International</Text>
            <Text style={styles.body}>
              We ship worldwide, typically within 7–14 business days depending on the destination.
              Any duties or import taxes are the responsibility of the recipient.
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.group, styles.groupBordered]}>
        <Text style={styles.groupEyebrow}>Returns</Text>
        <Text style={styles.groupTitle}>14 days, no interrogation</Text>
        <Text style={styles.body}>
          We accept returns within 14 days of delivery, provided items are unworn, unwashed and
          still have their tags attached.
        </Text>

        <View style={styles.steps}>
          {RETURN_STEPS.map((step, index) => (
            <View key={step.title} style={styles.step}>
              <Text style={styles.stepLabel}>Step {index + 1}</Text>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.body}>{step.body}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.dark}>
        <Text style={styles.darkTitle}>Size exchanges</Text>
        <Text style={styles.darkBody}>
          If a size does not fit, tell us within 14 days and we will exchange it for another size
          where stock allows. Any price difference is settled on the replacement order.
        </Text>

        <Text style={[styles.darkTitle, styles.darkSpaced]}>Fit feedback</Text>
        <Text style={styles.darkBody}>
          Fit is the hardest part of trousers, and we treat your feedback as data. If something felt
          off, tell us — that is how our size guide and future cuts improve.
        </Text>

        <View style={styles.darkActions}>
          <Pressable
            onPress={() => router.push('/contact')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.darkPrimary, pressed && styles.pressed]}
          >
            <Text style={styles.darkPrimaryText}>Start a return</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/faq')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.darkSecondary, pressed && styles.pressed]}
          >
            <Text style={styles.darkSecondaryText}>Read the FAQ</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { paddingHorizontal: spacing.xl, gap: spacing.xxl },
  header: { gap: spacing.sm },
  backText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.burntOrange },
  eyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.burntOrange,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginTop: spacing.md,
  },
  title: { fontFamily: fonts.serif, fontSize: 40, color: colors.ink },
  lede: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.charcoal },
  group: { gap: spacing.md },
  groupBordered: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.xxl,
  },
  groupEyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.burntOrange,
    letterSpacing: 0.22,
    textTransform: 'uppercase',
  },
  groupTitle: { fontFamily: fonts.serif, fontSize: 26, color: colors.ink },
  table: { marginTop: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowMain: { flex: 1, gap: 2 },
  methodLabel: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.ink },
  methodMeta: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted },
  methodCost: {
    fontFamily: fonts.sansMedium,
    fontSize: 15,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  body: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.charcoal },
  twoUp: { gap: spacing.xl, marginTop: spacing.sm },
  twoUpItem: { gap: spacing.sm },
  subTitle: { fontFamily: fonts.serif, fontSize: 20, color: colors.ink },
  steps: { gap: spacing.xl, marginTop: spacing.sm },
  step: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.25)',
    paddingTop: spacing.lg,
    gap: spacing.xs,
  },
  stepLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.burntOrange,
    letterSpacing: 0.22,
    textTransform: 'uppercase',
  },
  stepTitle: { fontFamily: fonts.serif, fontSize: 18, color: colors.ink, marginTop: spacing.xs },
  dark: {
    backgroundColor: colors.ink,
    borderRadius: radii.lg,
    padding: spacing.xl,
    gap: spacing.md,
  },
  darkTitle: { fontFamily: fonts.serif, fontSize: 22, color: colors.cream },
  darkSpaced: { marginTop: spacing.md },
  darkBody: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(246,242,234,0.75)',
  },
  darkActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.md },
  darkPrimary: {
    backgroundColor: colors.burntOrange,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  darkPrimaryText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.cream,
    letterSpacing: 0.14,
    textTransform: 'uppercase',
  },
  darkSecondary: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(246,242,234,0.5)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  darkSecondaryText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.cream,
    letterSpacing: 0.14,
    textTransform: 'uppercase',
  },
  pressed: { opacity: 0.85 },
});
