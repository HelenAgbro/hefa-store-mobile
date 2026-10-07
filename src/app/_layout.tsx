import { useEffect } from 'react';

import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_500Medium,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { colors } from '@/theme';

/**
 * Keep the splash screen up until the fonts have loaded.
 *
 * Without this the app would flash unstyled text in a system font, then jump
 * to Playfair a moment later. `SplashScreen.preventAutoHideAsync()` must run
 * at module scope (outside the component) — calling it during render would
 * re-run on every render.
 */
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  /**
   * `error` matters as much as the loaded flag: if the fonts fail to download
   * (offline first launch, for example) and we waited on `loaded` alone, the
   * splash screen would never lift and the app would look frozen. Treating
   * "finished, even if it failed" as ready means the app always opens.
   */
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_500Medium,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  /**
   * Release the splash screen once the fonts have settled.
   *
   * This pairs with `preventAutoHideAsync()` at the top of the file: that call
   * holds the splash screen open, and this one lets it go. Without this the
   * splash screen would never lift and the app would sit behind it forever.
   *
   * `|| fontError` keeps a slow or offline first launch working: if the fonts
   * never arrive we still open the app rather than appearing to hang.
   *
   * It sits above the early return on purpose. React requires every hook to run
   * on every render, and returning first would skip this one on the first pass.
   */
  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    /**
     * AuthProvider wraps the whole app so every screen reads the same
     * "who is signed in" answer. Without it, useAuth() throws — which is the
     * point: a screen quietly believing nobody is signed in would be a much
     * harder bug to find.
     */
    <AuthProvider>
      <CartProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.cream },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="shop" />
        <Stack.Screen name="product/[slug]" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="create-account" />
      </Stack>
      </CartProvider>
    </AuthProvider>
  );
}
