import type { Session, User } from '@supabase/supabase-js';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/lib/supabase';

/**
 * Sign in, create an account and sign out.
 *
 * ---------------------------------------------------------------------------
 * THE SAME ACCOUNTS AS THE WEBSITE
 * ---------------------------------------------------------------------------
 * The website has no user store of its own either — it calls Supabase Auth
 * through Server Actions. Calling it directly from the app means one set of
 * accounts serves both, so a customer can sign in on their phone and see
 * exactly the account they created in the browser.
 *
 * ---------------------------------------------------------------------------
 * WHY AUTH DOES NOT GO THROUGH THE API
 * ---------------------------------------------------------------------------
 * Deliberately. A login is a password comparison and a token issue — no secret
 * server key, no business logic worth hiding. Routing it through an API would
 * add a round trip to every sign-in for no gain, and would mean the app could
 * not sign in at all if the website were down.
 *
 * The shared cart is the opposite case, and it does go through the API, because
 * pricing and ownership need the server.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The shortest password Supabase will accept. */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Turn Supabase's technical error text into something a customer can act on.
 *
 * These messages are deliberately identical to the website's (src/lib/auth/
 * actions.ts there). A customer who reads one app's wording should not be given
 * different wording by the other.
 */
function friendlyError(message: string): string {
  const text = message.toLowerCase();

  if (text.includes('invalid login credentials')) {
    return 'That email and password did not match an account.';
  }
  if (text.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in.';
  }
  if (text.includes('user already registered')) {
    return 'An account already exists with this email. Try signing in instead.';
  }
  if (text.includes('password should be at least') || text.includes('password length')) {
    return `Please choose a password of at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (text.includes('rate limit') || text.includes('too many requests')) {
    return 'Too many attempts. Please wait a minute and try again.';
  }
  if (text.includes('provider') || text.includes('not enabled')) {
    return 'Sign in with Google is not set up yet. Use email and password for now.';
  }

  return message;
}

/** Either an error message for the customer, or the signed-in user. */
export type AuthResult = { error: string } | { user: User; session: Session | null };

/** True when Supabase is reachable and configured. */
export function isAuthConfigured(): boolean {
  return supabase !== null;
}
/** Sign in with an existing email and password. */
export async function signInWithPassword(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { error: 'Accounts are not set up yet. Please try again later.' };

  const trimmedEmail = email.trim();
  if (!EMAIL_PATTERN.test(trimmedEmail)) {
    return { error: 'Please enter a valid email address.' };
  }
  if (!password) return { error: 'Please enter your password.' };

  const { data, error } = await supabase.auth.signInWithPassword({
    email: trimmedEmail,
    password,
  });

  if (error) return { error: friendlyError(error.message) };
  if (!data.user) return { error: 'We could not sign you in. Please try again.' };

  return { user: data.user, session: data.session };
}

export interface SignUpValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/**
 * Create an account.
 *
 * The name is stored as user metadata, matching what the website's sign-up form
 * sends, so the two agree on where a customer's name lives.
 *
 * A missing session matters: when Supabase has email confirmation switched on
 * there is no session yet. Telling someone they are signed in when they are
 * not would be worse than saying plainly that the email has to be confirmed.
 */
export async function signUpWithPassword(values: SignUpValues): Promise<AuthResult> {
  if (!supabase) return { error: 'Accounts are not set up yet. Please try again later.' };

  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  const email = values.email.trim();

  if (!firstName) return { error: 'Please enter your first name.' };
  if (!lastName) return { error: 'Please enter your last name.' };
  if (!EMAIL_PATTERN.test(email)) return { error: 'Please enter a valid email address.' };
  if (values.password.length < MIN_PASSWORD_LENGTH) {
    return { error: `Please choose a password of at least ${MIN_PASSWORD_LENGTH} characters.` };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: values.password,
    options: {
      data: { first_name: firstName, last_name: lastName },
    },
  });

  if (error) return { error: friendlyError(error.message) };
  if (!data.user) return { error: 'We could not create your account. Please try again.' };

  return { user: data.user, session: data.session };
}

/** Sign out and forget the stored session. */
export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/**
 * The session already on the device, if there is one.
 *
 * Read on launch so a returning customer goes straight in rather than seeing
 * the sign-in screen again. Reading from AsyncStorage is asynchronous, hence
 * the loading state the UI waits on.
 */
export async function getStoredSession(): Promise<Session | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase.auth.getSession();
    return error ? null : data.session;
  } catch {
    // A corrupt or unreadable session is treated as "not signed in" rather than
    // an error the customer has to understand.
    return null;
  }
}

/**
 * Watch for sign-in and sign-out, including ones that happen elsewhere.
 *
 * This is how the app stays in step: a customer whose session expires, or who
 * signs out on the website, should not carry on browsing as if signed in.
 *
 * The returned function unsubscribes. Failing to call it leaves a listener
 * attached to a screen that has gone, which leaks on every visit.
 */
export function onAuthStateChange(callback: (session: Session | null) => void): () => void {
  if (!supabase) return () => {};

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return () => {
    data.subscription.unsubscribe();
  };
}

/** True when a result is an error rather than a success. */
export function isAuthError(result: AuthResult): result is { error: string } {
  return 'error' in result;
}

/**
 * Where Google sends the customer back to after signing in.
 *
 * `hefamobile://` is this app's own scheme (app.json), so the redirect opens
 * the app rather than a browser tab. While testing inside Expo Go the same
 * call returns an `exp://…` address instead — which is why Supabase's Redirect
 * URLs list needs both `hefamobile://**` and `exp://**`.
 */
const googleRedirectUri = makeRedirectUri({ path: 'auth/callback' });

/**
 * Lets a browser tab opened for sign-in hand control back to the app.
 * A no-op on native, required on web, so it is always called.
 */
WebBrowser.maybeCompleteAuthSession();

/** Either an error for the customer, a cancellation, or a completed sign-in. */
export type GoogleSignInResult = { error: string } | { canceled: true } | { signedIn: true };

/**
 * Sign in with Google.
 *
 * The same provider and the same Google Cloud key as the website, so a
 * customer who signed in with Google in the browser lands in the same account
 * here — one identity across both apps.
 *
 * Flow: ask Supabase for Google's sign-in address → open it in the phone's
 * browser → Google sends that browser back to our app's address carrying the
 * result → we hand it to Supabase, which stores the session on the device.
 *
 * Both reply shapes are handled on purpose: Supabase may return the tokens
 * directly or a one-time code to exchange, depending on project settings.
 * Supporting both means a settings change cannot silently break sign-in.
 */
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  if (!supabase) return { error: 'Accounts are not set up yet. Please try again later.' };

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: googleRedirectUri,
      skipBrowserRedirect: true,
      // Same as the website's request, so Google issues Supabase a refresh
      // token and long-lived identities behave identically on both apps.
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  });

  if (error) return { error: friendlyError(error.message) };
  if (!data.url) return { error: 'We could not start Google sign-in. Please try again.' };

  const result = await WebBrowser.openAuthSessionAsync(data.url, googleRedirectUri);

  // The customer backed out of the browser. Not an error — the form stays put.
  if (result.type !== 'success') return { canceled: true };

  const { params, errorCode } = QueryParams.getQueryParams(result.url);

  // Supabase sends failures back to the same address with the reason attached.
  const failureCode = errorCode ?? params.error_code;
  if (failureCode) {
    return {
      error: friendlyError(params.error_description ?? 'Google sign-in could not be completed. Please try again.'),
    };
  }

  const { access_token, refresh_token, code } = params;

  // Shape one: the tokens arrived directly (implicit flow).
  if (access_token && refresh_token) {
    const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
    if (sessionError) return { error: friendlyError(sessionError.message) };
    return { signedIn: true };
  }

  // Shape two: a one-time code arrived (PKCE flow) — exchange it for tokens.
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) return { error: friendlyError(exchangeError.message) };
    return { signedIn: true };
  }

  return { error: 'Google sign-in did not finish. Please try again.' };
}