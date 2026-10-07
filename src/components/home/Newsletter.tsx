import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Form';
import { colors, fonts, radii, spacing } from '@/theme';

/**
 * Newsletter sign-up.
 *
 * DEMO ONLY: the form does not send anything anywhere. It shows a local
 * confirmation so the interaction can be tested. A real mailing service will be
 * connected later — the same caveat the website carries.
 */
export function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <View style={styles.section}>
      <Text style={styles.eyebrow}>Newsletter</Text>
      <Text style={styles.title}>Be first to know</Text>
      <Text style={styles.lede}>
        Join the HEFA list for early access to new collections, lookbooks and private sales.
      </Text>

      {submitted ? (
        <Text style={styles.done} accessibilityRole="text">
          Thank you — you have been added to the list. (Demo only: no email was sent.)
        </Text>
      ) : (
        <View style={styles.form}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@email.com"
            placeholderTextColor={colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            accessibilityLabel="Email address"
            style={styles.input}
          />
          <Button
            label="Subscribe"
            onPress={() => {
              if (email.trim()) setSubmitted(true);
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.xxxl, paddingHorizontal: spacing.xl, gap: spacing.md },
  eyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.burntOrange,
    letterSpacing: 0.22,
    textTransform: 'uppercase',
  },
  title: { fontFamily: fonts.serif, fontSize: 26, color: colors.ink },
  lede: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.charcoal },
  form: { gap: spacing.md, marginTop: spacing.sm },
  input: {
    height: 54,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.2)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: '#fffdf9',
  },
  done: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.forest, marginTop: spacing.sm },
});
