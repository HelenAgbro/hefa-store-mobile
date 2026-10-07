import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, ErrorNotice, Field } from '@/components/Form';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@/context/AuthContext';
import { emptyAddress, readAddresses, saveAddresses } from '@/lib/account-api';
import type { Address } from '@/lib/types';
import { colors, fonts, radii, spacing } from '@/theme';

/** A stable-enough id for a client-created address. */
function newAddressId(): string {
  return `addr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * The address book.
 *
 * Addresses are stored on the customer's Supabase profile (user metadata) as a
 * single list, so every change — add, edit, remove, set-default — rewrites the
 * list and saves it whole. That keeps one code path instead of four.
 *
 * The list is a convenience for the customer. Checkout still asks for a
 * delivery address and sends it with the order, so a missing or stale saved
 * address can never send a parcel to the wrong place.
 */
export default function AddressesScreen() {
  const { user } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editing, setEditing] = useState<Address | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Seed from the profile, re-running only if a different customer signs in. */
  useEffect(() => {
    setAddresses(readAddresses(user));
  }, [user?.id]);

  async function persist(next: Address[]) {
    setIsSaving(true);
    setError(null);

    const message = await saveAddresses(next);

    setIsSaving(false);
    if (message) {
      setError(message);
      return false;
    }
    setAddresses(next);
    setEditing(null);
    return true;
  }

  async function handleSaveForm(address: Address) {
    const isNew = address.id.length === 0;
    const withId = isNew ? { ...address, id: newAddressId() } : address;

    let next = isNew
      ? [...addresses, withId]
      : addresses.map((existing) => (existing.id === withId.id ? withId : existing));

    // Only ever one default. Making this one default clears the rest.
    if (withId.isDefault) {
      next = next.map((existing) =>
        existing.id === withId.id ? existing : { ...existing, isDefault: false },
      );
    }
    // Whenever the list is non-empty it keeps exactly one default — this covers
    // the first address saved, and the case where someone unticks the default.
    if (next.length > 0 && !next.some((existing) => existing.isDefault)) {
      next = next.map((existing, index) =>
        index === 0 ? { ...existing, isDefault: true } : existing,
      );
    }

    await persist(next);
  }

  async function handleRemove(id: string) {
    let next = addresses.filter((address) => address.id !== id);
    // Removing the default promotes the next one, so the list never loses its default.
    if (next.length > 0 && !next.some((address) => address.isDefault)) {
      next = next.map((address, index) => (index === 0 ? { ...address, isDefault: true } : address));
    }
    await persist(next);
  }

  async function handleSetDefault(id: string) {
    const next = addresses.map((address) => ({ ...address, isDefault: address.id === id }));
    await persist(next);
  }

  if (editing) {
    return (
      <AddressForm
        address={editing}
        isSaving={isSaving}
        error={error}
        onCancel={() => {
          setEditing(null);
          setError(null);
        }}
        onSave={(address) => void handleSaveForm(address)}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Addresses" />

      <ScrollView contentContainerStyle={styles.content}>
        <ErrorNotice message={error} />

        {addresses.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No saved addresses</Text>
            <Text style={styles.emptyBody}>
              Save the places you order to, and checkout becomes quicker next time.
            </Text>
          </View>
        ) : (
          addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              isSaving={isSaving}
              onEdit={() => setEditing(address)}
              onRemove={() => void handleRemove(address.id)}
              onSetDefault={() => void handleSetDefault(address.id)}
            />
          ))
        )}

        <Button label="Add address" onPress={() => setEditing(emptyAddress())} />
      </ScrollView>
    </View>
  );
}

/** One saved address, with its actions. */
function AddressCard({
  address,
  isSaving,
  onEdit,
  onRemove,
  onSetDefault,
}: {
  address: Address;
  isSaving: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onSetDefault: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.cardLabel}>{address.label || 'Address'}</Text>
        {address.isDefault ? <Text style={styles.defaultBadge}>Default</Text> : null}
      </View>

      <Text style={styles.cardName}>{address.name}</Text>
      <Text style={styles.cardLine}>{address.line1}</Text>
      {address.line2 ? <Text style={styles.cardLine}>{address.line2}</Text> : null}
      <Text style={styles.cardLine}>
        {[address.city, address.region].filter(Boolean).join(', ')}
        {address.country ? ` · ${address.country}` : ''}
      </Text>
      {address.phone ? <Text style={styles.cardLine}>{address.phone}</Text> : null}

      <View style={styles.actions}>
        <Pressable onPress={onEdit} disabled={isSaving} hitSlop={8}>
          <Text style={styles.action}>Edit</Text>
        </Pressable>
        {!address.isDefault ? (
          <Pressable onPress={onSetDefault} disabled={isSaving} hitSlop={8}>
            <Text style={styles.action}>Make default</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={onRemove} disabled={isSaving} hitSlop={8}>
          <Text style={[styles.action, styles.actionDanger]}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** The add/edit form. Keeps its own draft so the list is untouched until saved. */
function AddressForm({
  address,
  isSaving,
  error,
  onCancel,
  onSave,
}: {
  address: Address;
  isSaving: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: (address: Address) => void;
}) {
  const [draft, setDraft] = useState<Address>(address);

  function set<K extends keyof Address>(key: K, value: Address[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title={address.id ? 'Edit address' : 'New address'} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Field
          label="Label"
          value={draft.label}
          onChangeText={(value) => set('label', value)}
          placeholder="Home, Work…"
          autoCapitalize="words"
        />
        <Field
          label="Full name"
          value={draft.name}
          onChangeText={(value) => set('name', value)}
          placeholder="Amara Okafor"
          autoCapitalize="words"
          autoComplete="name"
        />
        <Field
          label="Address line 1"
          value={draft.line1}
          onChangeText={(value) => set('line1', value)}
          placeholder="12 Awolowo Road"
        />
        <Field
          label="Address line 2"
          value={draft.line2}
          onChangeText={(value) => set('line2', value)}
          placeholder="Flat 3 (optional)"
        />
        <Field label="City" value={draft.city} onChangeText={(value) => set('city', value)} placeholder="Lagos" />
        <Field
          label="State / Region"
          value={draft.region}
          onChangeText={(value) => set('region', value)}
          placeholder="Lagos State"
        />
        <Field
          label="Country"
          value={draft.country}
          onChangeText={(value) => set('country', value)}
          placeholder="Nigeria"
        />
        <Field
          label="Phone"
          value={draft.phone}
          onChangeText={(value) => set('phone', value)}
          placeholder="0803 000 0000"
          keyboardType="phone-pad"
        />

        <Pressable
          onPress={() => set('isDefault', !draft.isDefault)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: draft.isDefault }}
          style={styles.checkboxRow}
        >
          <View style={[styles.checkbox, draft.isDefault && styles.checkboxOn]}>
            {draft.isDefault ? <Text style={styles.checkboxTick}>✓</Text> : null}
          </View>
          <Text style={styles.checkboxLabel}>Use as my default address</Text>
        </Pressable>

        <ErrorNotice message={error} />

        <Button label="Save address" onPress={() => onSave(draft)} isLoading={isSaving} />
        <Button label="Cancel" variant="secondary" onPress={onCancel} disabled={isSaving} />
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
  empty: { marginTop: spacing.xxl, gap: spacing.sm, alignItems: 'center' },
  emptyTitle: { fontFamily: fonts.serif, fontSize: 22, color: colors.ink },
  emptyBody: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: colors.charcoal,
    textAlign: 'center',
    maxWidth: 300,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: '#fbf8f2',
    padding: spacing.lg,
    gap: spacing.xs,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  cardLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.muted,
    letterSpacing: 0.16,
    textTransform: 'uppercase',
  },
  defaultBadge: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: colors.forest,
    letterSpacing: 0.14,
    textTransform: 'uppercase',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.forest,
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cardName: { fontFamily: fonts.sansMedium, fontSize: 15, color: colors.ink },
  cardLine: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19, color: colors.charcoal },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  action: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.burntOrange },
  actionDanger: { color: colors.charcoal },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radii.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  checkboxTick: { color: colors.cream, fontSize: 13, lineHeight: 16 },
  checkboxLabel: { fontFamily: fonts.sans, fontSize: 14, color: colors.charcoal },
});
