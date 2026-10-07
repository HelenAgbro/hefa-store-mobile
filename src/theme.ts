/**
 * HEFA — design tokens.
 *
 * Every colour, font and spacing value in the app lives here. Screens import
 * from this file instead of typing values inline, which means the whole app can
 * be restyled from this one place.
 *
 * The palette is copied exactly from the HEFA website (src/app/globals.css in
 * the web app) so the app and the site are visibly the same brand:
 * "Modern Afro-Minimalism" — luxury neutrals with earth-tone accents.
 */

/** Brand colours. Names describe the colour, so the name reads as intent. */
export const colors = {
  /** Primary — near-black ink. Body text and dark surfaces. */
  ink: '#0b0b0b',
  /** Primary neutral — warm cream. The app's background. */
  cream: '#f6f2ea',
  /** Primary neutral — soft charcoal. Secondary text and borders. */
  charcoal: '#2f2f2f',
  /** Accent — burnt orange. Primary buttons and highlights. */
  burntOrange: '#b4551f',
  /** Accent — deep ochre. */
  ochre: '#b8860b',
  /** Accent — forest green. */
  forest: '#1e3a2f',

  /** Muted text on cream, and hairline borders. */
  muted: '#8a8578',
  /** A hairline rule between sections. */
  border: '#e3ddd0',
  /** White, for text on dark or accent backgrounds. */
  onDark: '#ffffff',
} as const;

/**
 * Font family names.
 *
 * These are the names registered when the fonts load in src/app/_layout.tsx.
 * Until then, `useFonts` reports false and the app renders with a system font —
 * so the app still works on a slow connection, it just looks plainer.
 */
export const fonts = {
  /** Serif — headlines and the brand wordmark. */
  serif: 'PlayfairDisplay_400Regular',
  serifMedium: 'PlayfairDisplay_500Medium',
  serifSemiBold: 'PlayfairDisplay_600SemiBold',
  /** Sans — everything else. */
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
} as const;

/**
 * Spacing scale, in points.
 *
 * Using named steps instead of arbitrary numbers keeps spacing consistent —
 * a `gap` of 16 always looks the same everywhere in the app.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/**
 * Corner radii.
 *
 * HEFA is a minimal, editorial brand, so corners stay softly rounded rather
 * than heavily pill-shaped.
 */
export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  pill: 999,
} as const;

/**
 * Product photography is shot portrait, 4:5 (e.g. 1200x1500). Declaring the
 * ratio once means every grid, gallery and thumbnail crops identically instead
 * of each screen inventing its own height.
 */
export const IMAGE_ASPECT = 4 / 5;

/** Standard horizontal page padding, so screens line up with each other. */
export const SCREEN_PADDING = spacing.xl;
