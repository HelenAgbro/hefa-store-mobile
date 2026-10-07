import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

/**
 * The connection to the same Supabase project the website uses.
 *
 * Two environment variables come from .env.local:
 *
 *   EXPO_PUBLIC_SUPABASE_URL               the project's address
 *   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY   the public key
 *
 * The `EXPO_PUBLIC_` prefix is required for Expo to make a value visible to
 * the app. That prefix also means the value is baked into the app bundle, so
 * it is deliberately only used for things that are safe to publish — which the
 * publishable key is, because the database's Row Level Security rules decide
 * what it can actually reach.
 *
 * NOTE: the service-role key must never appear here. It bypasses every security
 * rule, and a key inside an app is a key anyone can read.
 */

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * True when both values are present.
 *
 * Screens use this to fall back to the offline catalogue instead of showing an
 * empty shop, so the app still works before any credentials are added.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

/**
 * The shared database client, or null when not configured.
 *
 * `storage: AsyncStorage` keeps a signed-in session on the device between app
 * launches. Sign-in itself is not built yet, but configuring it now means the
 * auth screens will not need this file changing later.
 *
 * `detectSessionInUrl` is switched off on purpose: that option is for web
 * browsers, which read the session out of the address bar. A native app has no
 * address bar, so leaving it on would only cause confusion.
 */
export const supabase =
  supabaseUrl && supabasePublishableKey
    ? createClient(supabaseUrl, supabasePublishableKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;
