import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';

import {
  getStoredSession,
  onAuthStateChange,
  signInWithGoogle as googleSignIn,
  signInWithPassword,
  signOut,
  signUpWithPassword,
  type GoogleSignInResult,
  type SignUpValues,
} from '@/lib/auth';

interface AuthContextValue {
  user: User | null;
  /** The access token the API needs. Null when nobody is signed in. */
  accessToken: string | null;
  /** True until the stored session has been read from the device. */
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (values: SignUpValues) => Promise<string | null>;
  /** Google sign-in: opens the phone's browser, then returns to the app. */
  signInWithGoogle: () => Promise<GoogleSignInResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Shares the signed-in customer with every screen.
 *
 * Why a provider rather than each screen asking Supabase directly: the answer
 * is asked for constantly — is the bag button showing a count, should the
 * account screen render, is checkout allowed — and asking once and sharing the
 * answer keeps them from disagreeing. A screen that read the session itself
 * could show "signed out" for a moment while another showed "signed in".
 *
 * Both sign-in helpers return an error message or null, rather than throwing.
 * The message is already written for a customer to read, so the screen can put
 * it straight on screen and never has to build one of its own.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore any session already on the device, then follow it as it changes.
  useEffect(() => {
    let cancelled = false;

    getStoredSession()
      .then((stored) => {
        if (!cancelled) setSession(stored);
      })
      .finally(() => {
        // Cleared even on failure, so a broken session read cannot leave the
        // app stuck on its loading screen forever.
        if (!cancelled) setIsLoading(false);
      });

    const unsubscribe = onAuthStateChange((next) => {
      if (!cancelled) setSession(next);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await signInWithPassword(email, password);
    // The listener above picks up the new session, so there is no need to set
    // it here — and doing both could briefly disagree with the stored one.
    return 'error' in result ? result.error : null;
  }, []);

  const signUp = useCallback(async (values: SignUpValues) => {
    const result = await signUpWithPassword(values);
    return 'error' in result ? result.error : null;
  }, []);

  const handleGoogleSignIn = useCallback(async () => googleSignIn(), []);

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      accessToken: session?.access_token ?? null,
      isLoading,
      signIn,
      signUp,
      signInWithGoogle: handleGoogleSignIn,
      signOut: handleSignOut,
    }),
    [session, isLoading, signIn, signUp, handleGoogleSignIn, handleSignOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Read the signed-in customer.
 *
 * Throws if used outside <AuthProvider>, because that is a wiring mistake in
 * the app rather than something a customer can cause — and failing silently
 * would leave every screen quietly showing "signed out".
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>.');
  }
  return context;
}