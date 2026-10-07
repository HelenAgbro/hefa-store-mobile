import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, spacing } from '@/theme';

/**
 * The heading at the top of an account sub-screen.
 *
 * The account pages sit inside a tab, so the navigator header is off and each
 * screen draws its own. Sharing this component keeps the back affordance and
 * the type identical across Orders, Addresses and Settings.
 *
 * The back control is a plain Pressable rather than a navigator header because
 * it needs to sit inside the scroll view's own padding and use the brand's
 * type — and it falls back to the account root if there is nothing to go back
 * to (a deep link opened the screen directly).
 */
export function ScreenHeader({ title, eyebrow = 'Account' }: { title: string; eyebrow?: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/account'))}
        accessibilityRole="button"
        accessibilityLabel={`Back to ${eyebrow}`}
        hitSlop={12}
        style={({ pressed }) => [styles.back, pressed && styles.backPressed]}
      >
        <Text style={styles.backText}>‹ {eyebrow}</Text>
      </Pressable>

      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  back: { alignSelf: 'flex-start' },
  backPressed: { opacity: 0.6 },
  backText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.burntOrange },
  title: { fontFamily: fonts.serif, fontSize: 28, color: colors.ink },
});
