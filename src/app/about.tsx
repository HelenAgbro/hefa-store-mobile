import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BRAND } from '@/lib/brand';
import { getEditorialImage } from '@/lib/editorialImages';
import { colors, fonts, radii, spacing } from '@/theme';

/**
 * About — the brand story, mirroring the website's page: a hero, the origin
 * story, four guiding ideas, and a timeline on the forest-green band.
 */

const PILLARS = [
  {
    title: 'Considered craft',
    body: 'Every pair is pattern-cut and finished with precision, using fabrics chosen for the Nigerian climate.',
  },
  {
    title: 'Restraint',
    body: 'Fewer pieces, considered harder. We would rather make eight silhouettes properly than forty quickly.',
  },
  {
    title: 'Identity',
    body: 'A contemporary line rooted in Nigerian design sensibility, made for a local and international wardrobe.',
  },
  {
    title: 'Longevity',
    body: 'Small production runs, repairable construction, and materials that wear in rather than wear out.',
  },
];

const TIMELINE = [
  {
    year: '2024',
    title: 'Founded in Lagos',
    body: 'HEFA began with a simple question: why is it so hard to find a well-cut pair of pants here?',
  },
  {
    year: '2025',
    title: 'The debut pants line',
    body: 'Eight silhouettes across corporate and casual, produced in small runs and tested with real customers.',
  },
  {
    year: 'Next',
    title: 'Expanding the wardrobe',
    body: 'Shirts, then suiting and occasionwear — each collection built on the same foundations.',
  },
];

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const studioImage = getEditorialImage('/images/lookbook-atlantic.jpg');

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
        <Text style={styles.eyebrow}>The label</Text>
        <Text style={styles.title}>A Nigerian label built on restraint, craft and identity.</Text>
        <Text style={styles.lede}>
          {BRAND.description} We make considered clothing for people who want fewer, better things.
        </Text>
      </View>

      <View style={styles.heroImage}>
        {studioImage ? <Image source={studioImage} style={styles.fill} resizeMode="cover" /> : null}
        <View style={styles.heroOverlay} />
        <Text style={styles.heroCaption}>Made in Lagos</Text>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupEyebrow}>Our story</Text>
        <Text style={styles.groupTitle}>It started with a pair of pants</Text>
        <Text style={styles.body}>
          HEFA was founded on a simple frustration: it was remarkably hard to buy a well-cut pair of
          trousers in Lagos. Options were either cheap and disposable, or imported, expensive and cut
          for a different climate entirely.
        </Text>
        <Text style={styles.body}>
          So we began with the trouser. Not because it is the easiest thing to sell, but because it is
          the hardest thing to get right — and a wardrobe is built on the pieces you reach for every
          day. We design in Lagos, produce in small runs, and build each collection to be extended
          rather than replaced.
        </Text>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupEyebrow}>What guides us</Text>
        <Text style={styles.groupTitle}>Four ideas behind every piece</Text>
        <View style={styles.pillars}>
          {PILLARS.map((pillar) => (
            <View key={pillar.title} style={styles.pillar}>
              <Text style={styles.pillarTitle}>{pillar.title}</Text>
              <Text style={styles.body}>{pillar.body}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.timeline}>
        <Text style={[styles.groupEyebrow, styles.onDarkEyebrow]}>The journey</Text>
        <Text style={[styles.groupTitle, styles.onDarkTitle]}>
          Where we are and what is next
        </Text>

        {TIMELINE.map((entry) => (
          <View key={entry.year} style={styles.tlItem}>
            <Text style={styles.tlYear}>{entry.year}</Text>
            <Text style={styles.tlTitle}>{entry.title}</Text>
            <Text style={styles.tlBody}>{entry.body}</Text>
          </View>
        ))}

        <View style={styles.timelineActions}>
          <Pressable
            onPress={() => router.push('/shop')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.darkPrimary, pressed && styles.pressed]}
          >
            <Text style={styles.darkPrimaryText}>Shop the collection</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/contact')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.darkSecondary, pressed && styles.pressed]}
          >
            <Text style={styles.darkSecondaryText}>Work with us</Text>
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
  title: { fontFamily: fonts.serif, fontSize: 34, lineHeight: 40, color: colors.ink },
  lede: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 23, color: colors.charcoal },
  fill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  heroImage: {
    marginHorizontal: spacing.xl,
    aspectRatio: 4 / 5,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.charcoal,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  heroCaption: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.onDark,
    padding: spacing.xl,
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
  body: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 22, color: colors.charcoal },
  pillars: { gap: spacing.xl, marginTop: spacing.sm },
  pillar: { gap: spacing.sm },
  pillarTitle: { fontFamily: fonts.serif, fontSize: 20, color: colors.ink },
  timeline: {
    marginHorizontal: spacing.xl,
    backgroundColor: colors.forest,
    borderRadius: radii.lg,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  onDarkEyebrow: { color: colors.ochre },
  onDarkTitle: { color: colors.cream },
  tlItem: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(246,242,234,0.25)',
    paddingTop: spacing.lg,
    gap: spacing.xs,
  },
  tlYear: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.ochre,
    letterSpacing: 0.22,
    textTransform: 'uppercase',
  },
  tlTitle: { fontFamily: fonts.serif, fontSize: 18, color: colors.cream, marginTop: spacing.xs },
  tlBody: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: 'rgba(246,242,234,0.75)' },
  timelineActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.md },
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
