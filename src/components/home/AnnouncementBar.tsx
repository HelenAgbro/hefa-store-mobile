import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, spacing } from '@/theme';

/**
 * Thin promotional strip at the very top of the home screen — the same line the
 * website shows. It draws its own top padding so the black bar reaches up under
 * the status bar rather than floating below a cream gap.
 */
export function AnnouncementBar() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingTop: insets.top + spacing.sm }]}>
      <Text style={styles.text}>
        Complimentary nationwide delivery on orders over ₦150,000 · Now shipping internationally
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.ink,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  text: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: colors.cream,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    textAlign: 'center',
    lineHeight: 16,
  },
});
