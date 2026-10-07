import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Field } from '@/components/Form';
import { BRAND } from '@/lib/brand';
import {
  CONTACT_TOPICS,
  INITIAL_CONTACT_VALUES,
  validateContact,
  type ContactErrors,
  type ContactValues,
} from '@/lib/contact';
import { colors, fonts, radii, spacing } from '@/theme';

/**
 * Contact screen — the enquiry form plus the studio's details.
 *
 * Like the website, the form validates and confirms without sending anything
 * (there is no mail service wired up yet), and the studio details open the
 * phone's own mail, dialler or WhatsApp through Linking.
 */

const DETAILS = [
  { label: 'Email', value: BRAND.email, href: `mailto:${BRAND.email}` },
  { label: 'Phone', value: BRAND.phone, href: `tel:${BRAND.phone.replace(/\s/g, '')}` },
  { label: 'Studio', value: BRAND.location, href: null },
] as const;

export default function ContactScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [values, setValues] = useState<ContactValues>(INITIAL_CONTACT_VALUES);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [sent, setSent] = useState(false);

  function setField<K extends keyof ContactValues>(key: K, value: ContactValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit() {
    const found = validateContact(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSent(true);
  }

  function openLink(href: string) {
    void Linking.openURL(href).catch(() => {});
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}
        keyboardShouldPersistTaps="handled"
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
          <Text style={styles.eyebrow}>Get in touch</Text>
          <Text style={styles.title}>Contact</Text>
          <Text style={styles.lede}>
            Questions about sizing, an order, or working together? Send a message and we will reply
            within two business days.
          </Text>
        </View>

        {sent ? (
          <View style={styles.success}>
            <Text style={styles.successTitle}>Message received</Text>
            <Text style={styles.successBody}>
              Thanks — we have your note and will reply within two business days.
            </Text>
            <Pressable
              onPress={() => {
                setSent(false);
                setValues(INITIAL_CONTACT_VALUES);
                setErrors({});
              }}
              accessibilityRole="button"
              style={({ pressed }) => [styles.reset, pressed && styles.pressed]}
            >
              <Text style={styles.resetText}>Send another message</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.demo}>
              <Text style={styles.demoStrong}>Demo only.</Text> Email delivery is not connected yet,
              so the form validates and confirms without sending anything.
            </Text>

            <View style={styles.fieldBlock}>
              <Field
                label="Name"
                value={values.name}
                onChangeText={(value) => setField('name', value)}
                autoCapitalize="words"
              />
              {errors.name ? <Text style={styles.fieldError}>{errors.name}</Text> : null}
            </View>

            <View style={styles.fieldBlock}>
              <Field
                label="Email"
                value={values.email}
                onChangeText={(value) => setField('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Topic</Text>
              <View style={styles.chips}>
                {CONTACT_TOPICS.map((topic) => {
                  const active = topic === values.topic;
                  return (
                    <Pressable
                      key={topic}
                      onPress={() => setField('topic', topic)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{topic}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {errors.topic ? <Text style={styles.fieldError}>{errors.topic}</Text> : null}
            </View>

            <View style={styles.fieldBlock}>
              <Field
                label="Message"
                value={values.message}
                onChangeText={(value) => setField('message', value)}
                multiline
                numberOfLines={5}
                placeholder="Tell us how we can help…"
              />
              {errors.message ? <Text style={styles.fieldError}>{errors.message}</Text> : null}
            </View>

            <Button label="Send message" onPress={handleSubmit} />
          </View>
        )}

        <View style={styles.group}>
          <Text style={styles.groupEyebrow}>Studio</Text>
          {DETAILS.map((detail) => (
            <View key={detail.label} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{detail.label}</Text>
              {detail.href ? (
                <Pressable
                  onPress={() => openLink(detail.href)}
                  accessibilityRole="link"
                  hitSlop={6}
                >
                  <Text style={styles.detailLink}>{detail.value}</Text>
                </Pressable>
              ) : (
                <Text style={styles.detailValue}>{detail.value}</Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.whatsapp}>
          <Text style={styles.groupEyebrow}>WhatsApp</Text>
          <Text style={styles.body}>
            Prefer to chat? Message us on WhatsApp for the quickest reply on sizing and order
            questions.
          </Text>
          <Pressable
            onPress={() => openLink(BRAND.whatsapp)}
            accessibilityRole="link"
            style={({ pressed }) => [styles.whatsappButton, pressed && styles.pressed]}
          >
            <Text style={styles.whatsappText}>Chat on WhatsApp</Text>
          </Pressable>
        </View>

        <View style={styles.group}>
          <Text style={styles.groupEyebrow}>Response times</Text>
          <Text style={styles.body}>
            Monday to Friday, 9am–5pm WAT. Messages sent outside these hours are answered the next
            business day.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  form: { gap: spacing.lg },
  demo: {
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 19,
    color: colors.muted,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed',
    borderColor: 'rgba(0,0,0,0.2)',
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  demoStrong: { fontFamily: fonts.sansMedium, color: colors.ink },
  fieldBlock: { gap: spacing.sm },
  fieldLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.charcoal,
    letterSpacing: 0.16,
    textTransform: 'uppercase',
  },
  fieldError: { fontFamily: fonts.sans, fontSize: 12, color: colors.burntOrange },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: '#fffdf9',
  },
  chipActive: { borderColor: colors.ink, backgroundColor: colors.ink },
  chipText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink },
  chipTextActive: { color: colors.cream },
  success: {
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: '#fbf8f2',
  },
  successTitle: { fontFamily: fonts.serif, fontSize: 24, color: colors.ink },
  successBody: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.charcoal },
  reset: { alignSelf: 'flex-start', paddingTop: spacing.sm },
  resetText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.burntOrange },
  group: { gap: spacing.md },
  groupEyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  detailRow: { gap: 2 },
  detailLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.14,
    textTransform: 'uppercase',
  },
  detailLink: {
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
    textDecorationLine: 'underline',
  },
  detailValue: { fontFamily: fonts.sans, fontSize: 15, color: colors.ink },
  whatsapp: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  whatsappButton: {
    alignSelf: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.charcoal,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  whatsappText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.ink,
    letterSpacing: 0.14,
    textTransform: 'uppercase',
  },
  body: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.charcoal },
  pressed: { opacity: 0.85 },
});
