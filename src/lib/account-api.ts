/**
 * The account section's data.
 *
 * ---------------------------------------------------------------------------
 * TWO SOURCES, ON PURPOSE
 * ---------------------------------------------------------------------------
 * Orders come from the API (GET /api/orders), because only the server may read
 * the orders table and re-price anything. The API decides whose orders these
 * are from the bearer token — the app never names a customer, so it cannot ask
 * for someone else's history.
 *
 * Profile details and the address book are stored in Supabase **user metadata**
 * (supabase.auth.updateUser). That choice is deliberate for now: it is real,
 * persisted, and needs no new database table or migration, so the feature works
 * today. The trade-off is that metadata is a small JSON blob — fine for a name,
 * a phone number and a handful of addresses, but not something you could query
 * or report on. A dedicated `addresses` table is the right home once anything
 * server-side needs to read them (label printing, delivery routing).
 */

import type { User } from '@supabase/supabase-js';

import { apiFetch } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import type { Address, Order } from '@/lib/types';

/** Every failure here is a message written for the customer, or null on success. */

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

/** The signed-in customer's order history, newest first. */
export async function fetchOrders(accessToken: string): Promise<Order[]> {
  const data = await apiFetch<{ orders: Order[] }>('/api/orders', { accessToken });
  return data.orders ?? [];
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export interface ProfileValues {
  firstName: string;
  lastName: string;
  phone: string;
}

/** The profile details we keep in metadata, with sensible blanks. */
export function readProfile(user: User | null): ProfileValues {
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  return {
    firstName: typeof meta.first_name === 'string' ? meta.first_name : '',
    lastName: typeof meta.last_name === 'string' ? meta.last_name : '',
    phone: typeof meta.phone === 'string' ? meta.phone : '',
  };
}

/** The name to greet a customer by, falling back to the email's first part. */
export function displayName(user: User | null): string {
  const { firstName, lastName } = readProfile(user);
  const full = `${firstName} ${lastName}`.trim();
  if (full) return full;
  return user?.email?.split('@')[0] ?? 'there';
}

/**
 * Save the profile details.
 *
 * updateUser merges the keys given into the existing metadata, so saving the
 * phone number does not wipe the name — and vice versa.
 */
export async function saveProfile(values: ProfileValues): Promise<string | null> {
  if (!supabase) return 'Accounts are not set up yet. Please try again later.';

  const { error } = await supabase.auth.updateUser({
    data: {
      first_name: values.firstName.trim(),
      last_name: values.lastName.trim(),
      phone: values.phone.trim(),
    },
  });

  return error ? error.message : null;
}

// ---------------------------------------------------------------------------
// Addresses
// ---------------------------------------------------------------------------

/** Read the address book out of metadata, ignoring anything malformed. */
export function readAddresses(user: User | null): Address[] {
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const raw = meta.addresses;

  if (!Array.isArray(raw)) return [];

  return raw
    .filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null)
    .map((entry) => ({
      id: String(entry.id ?? ''),
      label: String(entry.label ?? ''),
      name: String(entry.name ?? ''),
      line1: String(entry.line1 ?? ''),
      line2: String(entry.line2 ?? ''),
      city: String(entry.city ?? ''),
      region: String(entry.region ?? ''),
      country: String(entry.country ?? ''),
      phone: String(entry.phone ?? ''),
      isDefault: Boolean(entry.isDefault),
    }))
    .filter((address) => address.id.length > 0);
}

/**
 * Write the whole address book back.
 *
 * The list is stored as one value rather than one row per address, so every
 * change rewrites it whole. That is what makes add/edit/remove/default all the
 * same operation here.
 */
export async function saveAddresses(addresses: Address[]): Promise<string | null> {
  if (!supabase) return 'Accounts are not set up yet. Please try again later.';

  const { error } = await supabase.auth.updateUser({ data: { addresses } });
  return error ? error.message : null;
}

/** A blank address, for the "add" form. */
export function emptyAddress(): Address {
  return {
    id: '',
    label: 'Home',
    name: '',
    line1: '',
    line2: '',
    city: '',
    region: '',
    country: 'Nigeria',
    phone: '',
    isDefault: false,
  };
}
