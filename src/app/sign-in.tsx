import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Divider, ErrorNotice, Field, GoogleButton, LinkButton } from '@/components/Form';
import { useAuth } from '@/context/AuthContext';
import { colors, fonts, spacing } from '@/theme';

/**
 * Sign in to an existing HEFA account.
 *
 * These are the same accounts as the website's, so a customer can sign in here
 * with whatever they created in the browser and see the same cart and orders.
 */
export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function handleSignIn() {
    // Cleared on each attempt, so a stale failure never lingers over a fresh
    // try that has not run yet.
    setError(null);
    setIsSubmitting(true);

    try {
      const message = await signIn(email, password);

      if (message) {
        setError(message);
        return;
      }

      // Replace rather than push, so the hardware Back button cannot return to
      // a form the customer has already completed.
      router.replace('/');
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Continue with Google — the browser opens, Google confirms the customer,
   * and the app takes over once Supabase hands the session back.
   * A cancellation leaves the form as it was, with nothing to report.
   */
  async function handleGoogleSignIn() {
    setError(null);
    setIsGoogleLoading(true);

    try {
      const result = await signInWithGoogle();

      if ('error' in result) {
        setError(result.error);
        return;
      }

      if ('signedIn' in result) {
        // Replace rather than push, same as email sign-in, so Back cannot
        // return to a form the customer has already finished.
        router.replace('/');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  }

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.xxxl, paddingBottom: insets.bottom + spacing.xxxl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.wordmark}>HEFA</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to see your bag and orders.</Text>
        </View>

        <View style={styles.form}>
          <ErrorNotice message={error} />

          <GoogleButton onPress={handleGoogleSignIn} isLoading={isGoogleLoading} />

          <Divider label="or use email" />

          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Field
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
          />

          <Button
            label="Sign in"
            onPress={handleSignIn}
            isLoading={isSubmitting}
            disabled={!canSubmit}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to HEFA?</Text>
          <LinkButton label="Create an account" onPress={() => router.push('/create-account')} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.xxxl,
  },
  header: {
    gap: spacing.sm,
  },
  wordmark: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.ink,
    letterSpacing: 0.35,
  },
  title: {
    marginTop: spacing.md,
    fontFamily: fonts.serif,
    fontSize: 32,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: colors.charcoal,
  },
  form: {
    gap: spacing.lg,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.muted,
  },
});