import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';
import { Path, Svg } from 'react-native-svg';

import { colors, fonts, radii, spacing } from '@/theme';

/**
 * A labelled text field.
 *
 * Built once here so the sign-in and create-account screens cannot drift apart
 * in how they look or behave — a shared component is why they stay identical
 * without either screen having to remember to match the other.
 */

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  /** 'email' and 'numeric' bring up the right on-screen keyboard. */
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'words' | 'sentences';
  autoComplete?: 'email' | 'password' | 'name' | 'off';
  editable?: boolean;
  /** Turns the input into a taller, wrapping box (used for the contact message). */
  multiline?: boolean;
  numberOfLines?: number;
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'sentences',
  autoComplete = 'off',
  editable = true,
  multiline = false,
  numberOfLines = 4,
}: FieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        editable={editable}
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : undefined}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        /**
         * textContentType tells iOS and Android which password manager entry to
         * offer, so a customer with passwords saved can use them rather than
         * retyping. Harmless on Android, genuinely useful on iOS.
         */
        textContentType={secureTextEntry ? 'password' : autoComplete === 'off' ? 'none' : 'name'}
        style={[
          styles.input,
          // The border warms to the brand's burnt orange while focused, so the
          // customer can see which field they are in without reading the label.
          isFocused && styles.inputFocused,
          !editable && styles.inputDisabled,
          multiline && styles.inputMultiline,
        ]}
      />
    </View>
  );
}

/** A full-width button. */
export function Button({
  label,
  onPress,
  isLoading = false,
  disabled = false,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}) {
  const isInactive = disabled || isLoading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: isLoading }}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        isInactive && styles.buttonInactive,
        pressed && !isInactive && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.buttonLabel, variant === 'secondary' && styles.buttonLabelSecondary]}>
        {isLoading ? 'Please wait…' : label}
      </Text>
    </Pressable>
  );
}

/** An inline error, shown in place rather than as an alert. */
export function ErrorNotice({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <View style={styles.notice}>
      <Text style={styles.noticeText}>{message}</Text>
    </View>
  );
}

/** A link between the two screens. */
export function LinkButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="link"
      style={styles.link}
    >
      <Text style={[styles.linkText, disabled && styles.linkDisabled]}>{label}</Text>
    </Pressable>
  );
}

/**
 * "Continue with Google" — the same white button the website's login page
 * shows, so both apps offer sign-in the same way.
 *
 * The four coloured paths are Google's official G mark. They are drawn as
 * vectors because React Native has no HTML <svg> element to borrow from.
 */
export function GoogleButton({
  label = 'Continue with Google',
  onPress,
  isLoading = false,
}: {
  label?: string;
  onPress: () => void;
  isLoading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      accessibilityRole="button"
      accessibilityState={{ disabled: isLoading, busy: isLoading }}
      style={({ pressed }) => [
        styles.button,
        styles.googleButton,
        isLoading && styles.buttonInactive,
        pressed && !isLoading && styles.buttonPressed,
      ]}
    >
      <Svg width={18} height={18} viewBox="0 0 24 24">
        <Path
          fill="#4285F4"
          d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.87c2.27-2.09 3.58-5.17 3.58-8.81Z"
        />
        <Path
          fill="#34A853"
          d="M12 24c3.24 0 5.96-1.08 7.94-2.92l-3.88-3c-1.08.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.95H1.28v3.1A12 12 0 0 0 12 24Z"
        />
        <Path
          fill="#FBBC05"
          d="M5.28 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.28a12 12 0 0 0 0 10.76l4-3.1Z"
        />
        <Path
          fill="#EA4335"
          d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l4 3.1C6.23 6.87 8.88 4.77 12 4.77Z"
        />
      </Svg>
      <Text style={styles.googleLabel}>{isLoading ? 'Please wait…' : label}</Text>
    </Pressable>
  );
}

/**
 * The "or use email" rule between the Google button and the form — the same
 * divider the website's login page draws.
 */
export function Divider({ label }: { label: string }) {
  return (
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerLabel}>{label}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.charcoal,
    letterSpacing: 0.16,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#fffdf9',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontFamily: fonts.sans,
    fontSize: 16,
    color: colors.ink,
  },
  inputFocused: {
    borderColor: colors.burntOrange,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  inputMultiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: colors.ink,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.charcoal,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonInactive: {
    opacity: 0.45,
  },
  buttonLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.cream,
    letterSpacing: 0.18,
    textTransform: 'uppercase',
  },
  buttonLabelSecondary: {
    color: colors.ink,
  },
  notice: {
    backgroundColor: '#fdf0ea',
    borderLeftWidth: 3,
    borderLeftColor: colors.burntOrange,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  noticeText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: colors.ink,
  },
  link: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  linkText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.burntOrange,
  },
  linkDisabled: {
    color: colors.muted,
  },
  googleButton: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  googleLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.ink,
    letterSpacing: 0.18,
    textTransform: 'uppercase',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  dividerLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 0.18,
    textTransform: 'uppercase',
  },
});