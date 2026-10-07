import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Form';
import { useAuth } from '@/context/AuthContext';
import { colors, fonts, spacing } from '@/theme';

/**
 * The Account tab.
 *
 * ---------------------------------------------------------------------------
 * THIS LAYOUT IS THE GATE
 * ---------------------------------------------------------------------------
 * Every /account screen renders inside here, so one check protects the
 * overview, orders, addresses and settings together — the same structure the
 * website uses in src/app/account/layout.tsx.
 *
 * When nobody is signed in the nested stack is not rendered at all, which means
 * the deeper screens cannot be reached by any route, not merely hidden. That
 * matters because order history and addresses belong to a person.
 *
 * ---------------------------------------------------------------------------
 * WHY A NESTED STACK
 * ---------------------------------------------------------------------------
 * Drilling into Orders or Settings keeps the bottom tab bar visible, which is
 * how a phone is expected to behave. Each screen draws its own heading, so the
 * navigator header stays off.
 */
export default function AccountLayout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.burntOrange} />
      </View>
    );
  }

  if (!user) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.signedOut, { paddingTop: insets.top + spacing.xl }]}
      >
        <View style={styles.header}>
          <Text style={styles.wordmark}>HEFA</Text>
          <Text style={styles.title}>Account</Text>
        </View>

        <Text style={styles.body}>
          Sign in to keep your bag and orders in step between this phone and the website.
        </Text>

        <Button label="Sign in" onPress={() => router.push('/sign-in')} />
        <Button
          label="Create an account"
          variant="secondary"
          onPress={() => router.push('/create-account')}
        />
      </ScrollView>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.cream },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="addresses" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  centered: { flex: 1, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
  signedOut: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  header: { gap: spacing.xs, marginBottom: spacing.md },
  wordmark: {
    fontFamily: fonts.serif,
    fontSize: 16,
    color: colors.ink,
    letterSpacing: 0.35,
  },
  title: { fontFamily: fonts.serif, fontSize: 32, color: colors.ink },
  body: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.charcoal },
});
