import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Form';
import { useAuth } from '@/context/AuthContext';
import { colors, fonts, radii, spacing } from '@/theme';

/**
 * The Account tab.
 *
 * Deliberately small for now: it answers "am I signed in?" and gives a way in
 * or out. The account's own pages — order history, addresses, settings — are a
 * following step, and will hang off here.
 *
 * Signing in here uses the same accounts as the website, which is what makes
 * the bag and (later) the order history appear on both.
 */
export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.xl }]}
    >
      <View style={styles.header}>
        <Text style={styles.wordmark}>HEFA</Text>
        <Text style={styles.title}>Account</Text>
      </View>

      {user ? (
        <View style={styles.stack}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Signed in as</Text>
            <Text style={styles.cardValue}>{user.email}</Text>
          </View>

          <Button label="Sign out" variant="secondary" onPress={() => void signOut()} />
        </View>
      ) : (
        <View style={styles.stack}>
          <Text style={styles.body}>
            Sign in to keep your bag and orders in step between this phone and the website.
          </Text>

          <Button label="Sign in" onPress={() => router.push('/sign-in')} />
          <Button
            label="Create an account"
            variant="secondary"
            onPress={() => router.push('/create-account')}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xxl,
  },
  header: { gap: spacing.xs },
  wordmark: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.ink,
    letterSpacing: 0.35,
  },
  title: { fontFamily: fonts.serif, fontSize: 32, color: colors.ink },
  stack: { gap: spacing.lg },
  body: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.charcoal },
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
  cardValue: { fontFamily: fonts.sans, fontSize: 15, color: colors.ink },
});
