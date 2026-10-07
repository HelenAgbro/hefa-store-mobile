import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, ErrorNotice, Field } from '@/components/Form';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@/context/AuthContext';
import { readProfile, saveProfile } from '@/lib/account-api';
import { colors, fonts, radii, spacing } from '@/theme';

/**
 * Settings — the customer's name and contact details.
 *
 * These live in the Supabase profile (user metadata), so they follow the
 * customer to the website and back. The email address is shown but not editable:
 * changing an email is an account-verification flow, not a text field, and
 * quietly accepting a new one here would leave the account unreachable until it
 * was confirmed.
 */
export default function SettingsScreen() {
  const { user } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  /**
   * Seed the fields from the profile once it is available. Keyed on the user's
   * id so that saving (which updates the user object) does not overwrite what
   * the customer is currently typing.
   */
  useEffect(() => {
    const profile = readProfile(user);
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setPhone(profile.phone);
  }, [user?.id]);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setSaved(false);

    const message = await saveProfile({ firstName, lastName, phone });

    setIsSaving(false);
    if (message) {
      setError(message);
    } else {
      setSaved(true);
    }
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Settings" />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Email</Text>
          <Text style={styles.cardValue}>{user?.email}</Text>
          <Text style={styles.cardHint}>Your sign-in address. Contact us to change it.</Text>
        </View>

        <Field
          label="First name"
          value={firstName}
          onChangeText={(value) => {
            setFirstName(value);
            setSaved(false);
          }}
          placeholder="Amara"
          autoCapitalize="words"
          autoComplete="name"
        />

        <Field
          label="Last name"
          value={lastName}
          onChangeText={(value) => {
            setLastName(value);
            setSaved(false);
          }}
          placeholder="Okafor"
          autoCapitalize="words"
          autoComplete="name"
        />

        <Field
          label="Phone"
          value={phone}
          onChangeText={(value) => {
            setPhone(value);
            setSaved(false);
          }}
          placeholder="0803 000 0000"
          keyboardType="phone-pad"
          autoComplete="off"
        />

        <ErrorNotice message={error} />
        {saved ? (
          <View style={styles.success}>
            <Text style={styles.successText}>Your details have been saved.</Text>
          </View>
        ) : null}

        <Button label="Save changes" onPress={() => void handleSave()} isLoading={isSaving} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
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
  cardHint: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted },
  success: {
    backgroundColor: '#eef4ef',
    borderLeftWidth: 3,
    borderLeftColor: colors.forest,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  successText: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.ink },
});
