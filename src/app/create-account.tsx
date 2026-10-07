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
import { MIN_PASSWORD_LENGTH } from '@/lib/auth';
import { colors, fonts, spacing } from '@/theme';

/**
 * Create a HEFA account.
 *
 * The name is saved the same way the website saves it, so both apps read the
 * same customer details from the same place.
 */
export default function CreateAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp, signInWithGoogle } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  async function handleSignUp() {
    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    try {
      const message = await signUp({ firstName, lastName, email, password });

      if (message) {
        setError(message);
        return;
      }

      router.replace('/');
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Continue with Google — an existing Google account already has everything
   * this form asks for, so the customer should not have to retype it.
   * A cancellation leaves the form as it was, with nothing to report.
   */
  async function handleGoogleSignIn() {
    setError(null);
    setNotice(null);
    setIsGoogleLoading(true);

    try {
      const result = await signInWithGoogle();

      if ('error' in result) {
        setError(result.error);
        return;
      }

      if ('signedIn' in result) {
        router.replace('/');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  }

  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= MIN_PASSWORD_LENGTH &&
    !isSubmitting;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xxxl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.wordmark}>HEFA</Text>
          <Text style={styles.title}>Create an account</Text>
          <Text style={styles.subtitle}>
            One account for the website and the app.
          </Text>
        </View>

        <View style={styles.form}>
          <ErrorNotice message={error ?? notice} />

          <GoogleButton onPress={handleGoogleSignIn} isLoading={isGoogleLoading} />

          <Divider label="or use email" />

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <Field
                label="First name"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Ada"
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>
            <View style={styles.rowItem}>
              <Field
                label="Last name"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Obi"
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>
          </View>

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
            placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
          />
        </View>

        <Button
          label="Create account"
          onPress={handleSignUp}
          isLoading={isSubmitting}
          disabled={!canSubmit}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <LinkButton label="Sign in" onPress={() => router.replace('/sign-in')} />
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
    gap: spacing.xxl,
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowItem: {
    flex: 1,
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