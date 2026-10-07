import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

import { useCart } from '@/context/CartContext';
import { colors, fonts } from '@/theme';

/**
 * The bottom tab bar.
 *
 * ---------------------------------------------------------------------------
 * WHY A ROUTE GROUP
 * ---------------------------------------------------------------------------
 * The folder is named `(tabs)`. Parentheses tell Expo Router that the folder is
 * for organisation only — it does not appear in the URL. So `/shop` and `/cart`
 * keep the addresses they already had, and every existing link to them still
 * works.
 *
 * ---------------------------------------------------------------------------
 * WHY SOME SCREENS ARE NOT TABS
 * ---------------------------------------------------------------------------
 * Product pages and checkout deliberately live outside this group (see
 * src/app/_layout.tsx). A payment flow or a product page should cover the whole
 * screen and slide away again, not sit inside a tab with the bar still showing.
 *
 * ---------------------------------------------------------------------------
 * THE BAG BADGE
 * ---------------------------------------------------------------------------
 * The count comes from CartContext, which is the same shared answer the bag
 * screen renders. That matters: an item added on the website arrives through
 * the API, updates the context, and the badge moves without this file knowing
 * anything about where the change came from.
 */
export default function TabsLayout() {
  const { totalItems } = useCart();

  return (
    <Tabs
      screenOptions={{
        // Each screen draws its own header (the HEFA wordmark), so the default
        // navigator header would be a second, competing one.
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.cream,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.sansMedium,
          fontSize: 10,
          letterSpacing: 0.14,
          textTransform: 'uppercase',
        },
        // Burnt orange rather than the default red, so the badge reads as part
        // of the brand rather than an alert.
        tabBarBadgeStyle: {
          backgroundColor: colors.burntOrange,
          color: colors.cream,
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: 'Bag',
          // `undefined` hides the badge entirely, so an empty bag shows nothing
          // rather than a "0".
          tabBarBadge: totalItems > 0 ? totalItems : undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bag-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
