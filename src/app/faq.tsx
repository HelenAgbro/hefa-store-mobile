import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Accordion } from '@/components/Accordion';
import { FAQS, FAQ_CATEGORIES } from '@/lib/data/faqs';
import { colors, fonts, radii, spacing } from '@/theme';

/**
 * FAQ screen — the same four categories and twelve answers as the website.
 *
 * The layout stacks what the browser shows in columns: the eyebrow, then the
 * questions grouped by category, then the "still have a question?" call to
 * action that links on to Contact and Shipping & Returns.
 */
export default function FaqScreen() {
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
        <Text style={styles.eyebrow}>Need to know</Text>
        <Text style={styles.title}>FAQ</Text>
        <Text style={styles.lede}>
          Common questions about fit, orders, delivery and returns. Still stuck? Send us a message
          and we will help.
        </Text>
      </View>

      {FAQ_CATEGORIES.map((category) => {
        const items = FAQS.filter((item) => item.category === category);
        if (items.length === 0) return null;

        return (
          <View key={category} style={styles.group}>
            <Text style={styles.groupTitle}>{category}</Text>
            <Accordion items={items} />
          </View>
        );
      })}

      <View style={styles.cta}>
        <Text style={styles.ctaTitle}>Still have a question?</Text>
        <Text style={styles.ctaBody}>
          Our team replies to every message, usually within two business days.
        </Text>
        <View style={styles.ctaActions}>
          <Pressable
            onPress={() => router.push('/contact')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
          >
            <Text style={styles.primaryText}>Contact us</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/shipping-returns')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
          >
            <Text style={styles.secondaryText}>Shipping &amp; returns</Text>
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
  groupTitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  cta: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  ctaTitle: { fontFamily: fonts.serif, fontSize: 22, color: colors.ink },
  ctaBody: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.charcoal },
  ctaActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
  primary: {
    backgroundColor: colors.ink,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  primaryText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.cream,
    letterSpacing: 0.14,
    textTransform: 'uppercase',
  },
  secondary: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.charcoal,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  secondaryText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.ink,
    letterSpacing: 0.14,
    textTransform: 'uppercase',
  },
  pressed: { opacity: 0.85 },
});
