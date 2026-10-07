import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LOOKBOOK } from '@/lib/data/lookbook';
import { getEditorialImage } from '@/lib/editorialImages';
import { colors, fonts, radii, spacing } from '@/theme';

/**
 * Lookbook — the AW25 campaign, mirroring the website's editorial page.
 *
 * The first entry gets a full-width portrait feature; the rest fall into a
 * two-column grid. Captions sit over a gradient so they stay readable whatever
 * the photograph does at the bottom edge.
 */

const [feature, ...rest] = LOOKBOOK;

export default function LookbookScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const featureImage = feature ? getEditorialImage(feature.image) : null;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxxl }]}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
        >
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.eyebrow}>Campaign AW25</Text>
        <Text style={styles.title}>Lookbook</Text>
        <Text style={styles.lede}>
          Our debut campaign, photographed on location in Lagos. Tailored pants styled for the
          studio, the street and the space in between.
        </Text>
      </View>

      {feature ? (
        <View style={[styles.feature, { backgroundColor: feature.swatch }]}>
          {featureImage ? (
            <Image source={featureImage} style={styles.fill} resizeMode="cover" />
          ) : null}
          <View style={styles.overlay} />
          <View style={styles.featureCaption}>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureMeta}>{feature.caption}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.group}>
        <Text style={styles.groupEyebrow}>The edit</Text>
        <Text style={styles.groupTitle}>Look by look</Text>

        <View style={styles.grid}>
          {rest.map((entry) => {
            const image = getEditorialImage(entry.image);
            return (
              <View key={entry.id} style={[styles.tile, { backgroundColor: entry.swatch }]}>
                {image ? <Image source={image} style={styles.fill} resizeMode="cover" /> : null}
                <View style={styles.overlay} />
                <View style={styles.tileCaption}>
                  <Text style={styles.tileTitle}>{entry.title}</Text>
                  <Text style={styles.tileMeta}>{entry.caption}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.dark}>
        <Text style={styles.quote}>
          “The wardrobe should be small, and the pieces should be serious.”
        </Text>
        <View style={styles.darkActions}>
          <Pressable
            onPress={() => router.push('/shop')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.darkPrimary, pressed && styles.pressed]}
          >
            <Text style={styles.darkPrimaryText}>Shop the collection</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/about')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.darkSecondary, pressed && styles.pressed]}
          >
            <Text style={styles.darkSecondaryText}>About HEFA</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  content: { gap: spacing.xxl },
  header: { gap: spacing.sm, paddingHorizontal: spacing.xl },
  backText: { fontFamily: fonts.sansMedium, fontSize: 13, color: colors.burntOrange },
  eyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.burntOrange,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginTop: spacing.md,
  },
  title: { fontFamily: fonts.serif, fontSize: 40, color: colors.ink },
  lede: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.charcoal },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  feature: {
    marginHorizontal: spacing.xl,
    aspectRatio: 3 / 4,
    borderRadius: radii.md,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  featureCaption: { padding: spacing.xl, gap: spacing.xs },
  featureTitle: { fontFamily: fonts.serif, fontSize: 26, color: colors.onDark },
  featureMeta: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.18,
    textTransform: 'uppercase',
  },
  group: { gap: spacing.md, paddingHorizontal: spacing.xl },
  groupEyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.burntOrange,
    letterSpacing: 0.22,
    textTransform: 'uppercase',
  },
  groupTitle: { fontFamily: fonts.serif, fontSize: 26, color: colors.ink },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
  tile: {
    width: '48%',
    aspectRatio: 4 / 5,
    borderRadius: radii.sm,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  tileCaption: { padding: spacing.lg, gap: 2 },
  tileTitle: { fontFamily: fonts.serif, fontSize: 17, color: colors.onDark },
  tileMeta: {
    fontFamily: fonts.sansMedium,
    fontSize: 9,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.18,
    textTransform: 'uppercase',
  },
  dark: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.ink,
    borderRadius: radii.lg,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  quote: { fontFamily: fonts.serif, fontSize: 22, lineHeight: 30, color: colors.cream },
  darkActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  darkPrimary: {
    backgroundColor: colors.burntOrange,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  darkPrimaryText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.cream,
    letterSpacing: 0.14,
    textTransform: 'uppercase',
  },
  darkSecondary: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(246,242,234,0.5)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  darkSecondaryText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.cream,
    letterSpacing: 0.14,
    textTransform: 'uppercase',
  },
  pressed: { opacity: 0.85 },
});
