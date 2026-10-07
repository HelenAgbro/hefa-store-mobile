import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';

import { Button, ErrorNotice, Field } from '@/components/Form';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  COUNTRIES,
  INITIAL_CHECKOUT_VALUES,
  SHIPPING_METHODS,
  getShippingCost,
  validateCheckout,
  type CheckoutErrors,
  type CheckoutValues,
} from '@/lib/checkout';
import { confirmOrder, startCheckout, type OrderStatus } from '@/lib/checkout-api';
import { formatNaira } from '@/lib/format';
import { colors, fonts, radii, spacing } from '@/theme';

/**
 * Paying from the phone.
 *
 * The customer fills in the same details the website asks for, the server
 * prices the order and hands back a Paystack URL, the phone opens it in an
 * in-app browser, and once that browser closes the app asks the server whether
 * the payment actually went through. The server is the only thing that ever
 * decides an order is paid — the app just reports what it is told.
 */

/** Where Paystack returns to. The scheme is the app's own (app.json). */
const REDIRECT_URL = 'hefamobile://checkout/verify';

/**
 * Pull a query value out of a callback URL.
 *
 * Parsed by hand rather than with URLSearchParams, whose behaviour varies
 * between JavaScript engines — and a callback we misread would look like a
 * failed payment.
 */
function readParam(url: string, key: string): string | null {
  const match = url.match(new RegExp(`[?&]${key}=([^&]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** A row of tappable options, used for country and delivery method. */
function OptionChips({
  options,
  selected,
  onSelect,
}: {
  options: { id: string; label: string; sublabel?: string }[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <View style={styles.chips}>
      {options.map((option) => {
        const isActive = option.id === selected;
        return (
          <Pressable
            key={option.id}
            onPress={() => onSelect(option.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isActive }}
            style={[styles.chip, isActive && styles.chipActive]}
          >
            <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>
              {option.label}
            </Text>
            {option.sublabel ? (
              <Text style={[styles.chipSub, isActive && styles.chipSubActive]}>{option.sublabel}</Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, accessToken } = useAuth();
  const { items, totalItems, subtotal, clear } = useCart();

  const [values, setValues] = useState<CheckoutValues>(INITIAL_CHECKOUT_VALUES);
  const [fieldErrors, setFieldErrors] = useState<CheckoutErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<OrderStatus | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  const shipping = getShippingCost(values.shippingMethod, subtotal);
  const total = subtotal + shipping;

  function setField(key: keyof CheckoutValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handlePay() {
    setError(null);
    setResult(null);

    // Catch obvious mistakes before a round trip. The server checks again.
    const errors = validateCheckout(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError('Please correct the highlighted fields.');
      return;
    }

    if (items.length === 0) {
      setError('Your bag is empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. The server prices the order and asks Paystack for a payment URL.
      const started = await startCheckout({ values, items, accessToken });
      setReference(started.reference);

      // 2. Send the customer to pay. openAuthSessionAsync returns when the
      //    in-app browser closes — whether they paid, cancelled, or just tapped
      //    Done. We do not trust that signal; we ask the server next.
      const session = await WebBrowser.openAuthSessionAsync(started.authorizationUrl, REDIRECT_URL);

      // 3. Confirm with the server, which re-checks Paystack itself. A deep
      //    link back carries its own reference; fall back to the one we hold.
      const callbackReference =
        (session.type === 'success' ? readParam(session.url, 'reference') : null) ?? started.reference;

      const status = await confirmOrder(callbackReference, started.token);
      setResult(status);

      // 4. A paid order empties the bag, exactly as the website does.
      if (status.status === 'paid') {
        await clear();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'We could not start checkout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }


  // ---- Result view ---------------------------------------------------------
  if (result) {
    const paid = result.status === 'paid';
    const pending = result.status === 'success';
    const heading = paid
      ? 'Payment received'
      : pending
        ? 'Payment processing'
        : 'Payment not completed';
    const body = paid
      ? `Thank you. Your order ${reference ?? ''} is confirmed and we will be in touch by email.`
      : pending
        ? `Your order ${reference ?? ''} is being confirmed. We will email you shortly.`
        : result.message ??
          `Your order ${reference ?? ''} was not paid. Your bag is untouched — you can try again.`;

    return (
      <View
        style={[
          styles.screen,
          { paddingTop: insets.top + spacing.xxl, paddingBottom: insets.bottom + spacing.xl },
        ]}
      >
        <View style={styles.resultBox}>
          <Text style={styles.resultHeading}>{heading}</Text>
          <Text style={styles.resultBody}>{body}</Text>
        </View>
        <View style={styles.resultActions}>
          {!paid && !pending ? (
            <Button label="Try again" onPress={() => setResult(null)} />
          ) : null}
          <Button label="Back to shop" variant="secondary" onPress={() => router.replace('/shop')} />
        </View>
      </View>
    );
  }

  // ---- Empty bag -----------------------------------------------------------
  if (items.length === 0) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top + spacing.xxl }]}>
        <Text style={styles.resultHeading}>Your bag is empty</Text>
        <Text style={styles.resultBody}>Add something beautiful before checking out.</Text>
        <Button label="Shop the collection" onPress={() => router.push('/shop')} />
      </View>
    );
  }


  // ---- Form ----------------------------------------------------------------
  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xxl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.backText}>‹ Back</Text>
          </Pressable>
          <Text style={styles.title}>Checkout</Text>
          <Text style={styles.subtitle}>
            {user ? `Signed in as ${user.email}` : 'Checking out as a guest'}
          </Text>
        </View>

        <ErrorNotice message={error} />

        <Text style={styles.sectionTitle}>Contact</Text>
        <View style={styles.form}>
          <Field label="First name" value={values.firstName} onChangeText={(v) => setField('firstName', v)} autoCapitalize="words" />
          {fieldErrors.firstName ? <Text style={styles.fieldError}>{fieldErrors.firstName}</Text> : null}
          <Field label="Last name" value={values.lastName} onChangeText={(v) => setField('lastName', v)} autoCapitalize="words" />
          {fieldErrors.lastName ? <Text style={styles.fieldError}>{fieldErrors.lastName}</Text> : null}
          <Field label="Email" value={values.email} onChangeText={(v) => setField('email', v)} keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}
          <Field label="Phone" value={values.phone} onChangeText={(v) => setField('phone', v)} keyboardType="phone-pad" />
          {fieldErrors.phone ? <Text style={styles.fieldError}>{fieldErrors.phone}</Text> : null}
        </View>

        <Text style={styles.sectionTitle}>Shipping address</Text>
        <View style={styles.form}>
          <Field label="Street address" value={values.address1} onChangeText={(v) => setField('address1', v)} autoCapitalize="words" />
          {fieldErrors.address1 ? <Text style={styles.fieldError}>{fieldErrors.address1}</Text> : null}
          <Field label="Apartment, suite, etc. (optional)" value={values.address2} onChangeText={(v) => setField('address2', v)} autoCapitalize="words" />
          <Field label="City" value={values.city} onChangeText={(v) => setField('city', v)} autoCapitalize="words" />
          {fieldErrors.city ? <Text style={styles.fieldError}>{fieldErrors.city}</Text> : null}
          <Field label="State / region" value={values.region} onChangeText={(v) => setField('region', v)} autoCapitalize="words" />
          {fieldErrors.region ? <Text style={styles.fieldError}>{fieldErrors.region}</Text> : null}
          <Field label="Postal code (optional)" value={values.postalCode} onChangeText={(v) => setField('postalCode', v)} autoCapitalize="none" />
        </View>

        <Text style={styles.sectionTitle}>Country</Text>
        <OptionChips
          options={COUNTRIES.map((country) => ({ id: country, label: country }))}
          selected={values.country}
          onSelect={(id) => setField('country', id)}
        />
        {fieldErrors.country ? <Text style={styles.fieldError}>{fieldErrors.country}</Text> : null}

        <Text style={styles.sectionTitle}>Delivery</Text>
        <OptionChips
          options={SHIPPING_METHODS.map((method) => ({
            id: method.id,
            label: method.label,
            sublabel: `${method.description} · ${
              getShippingCost(method.id, subtotal) === 0 ? 'Free' : formatNaira(method.price)
            }`,
          }))}
          selected={values.shippingMethod}
          onSelect={(id) => setField('shippingMethod', id)}
        />

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})
            </Text>
            <Text style={styles.summaryValue}>{formatNaira(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>{shipping === 0 ? 'Free' : formatNaira(shipping)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotalRow]}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>{formatNaira(total)}</Text>
          </View>
        </View>

        <Button
          label={`Pay ${formatNaira(total)}`}
          onPress={handlePay}
          isLoading={isSubmitting}
          disabled={isSubmitting}
        />
        <Text style={styles.note}>
          You will be sent to Paystack to pay securely. HEFA never sees your card details.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream, paddingHorizontal: spacing.xl },
  centered: { alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  content: { gap: spacing.lg },
  header: { gap: spacing.xs },
  backText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.burntOrange },
  title: { fontFamily: fonts.serif, fontSize: 32, color: colors.ink },
  subtitle: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted },
  sectionTitle: {
    marginTop: spacing.md,
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.charcoal,
    letterSpacing: 0.16,
    textTransform: 'uppercase',
  },
  form: { gap: spacing.md },
  fieldError: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.burntOrange,
    marginTop: -spacing.sm,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: '#fffdf9',
    gap: 2,
  },
  chipActive: { borderColor: colors.ink, backgroundColor: colors.ink },
  chipLabel: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.ink },
  chipLabelActive: { color: colors.cream },
  chipSub: { fontFamily: fonts.sans, fontSize: 11, color: colors.muted },
  chipSubActive: { color: '#cfc7b8' },
  summary: {
    marginTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  summaryLabel: { fontFamily: fonts.sans, fontSize: 13, color: colors.muted },
  summaryValue: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink },
  summaryTotalRow: { marginTop: spacing.xs },
  summaryTotalLabel: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.12,
  },
  summaryTotalValue: { fontFamily: fonts.serif, fontSize: 24, color: colors.ink },
  note: { fontFamily: fonts.sans, fontSize: 12, color: colors.muted, textAlign: 'center' },
  resultBox: { gap: spacing.sm, marginTop: spacing.xxl },
  resultHeading: { fontFamily: fonts.serif, fontSize: 28, color: colors.ink },
  resultBody: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.charcoal },
  resultActions: { marginTop: spacing.xl, gap: spacing.md },
});

