import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { LOOKBOOK } from '@/lib/data/lookbook';
import { getEditorialImage } from '@/lib/editorialImages';
import { colors, fonts, radii, spacing } from '@/theme';

/** Grid of lookbook entries linking through to the full lookbook screen. */
export function LookbookPreview() {
  const router = useRouter();

  return (
    <View style={styles.section}>
      <Text style={styles.eyebrow}>Lookbook</Text>
      <Text style={styles.title}>Styled for the season</Text>
      <Text style={styles.lede}>A preview of the debut campaign, shot on location in Lagos.</Text>

      <View style={styles.grid}>
        {LOOKBOOK.map((entry) => {
          const image = getEditorialImage(entry.image);
          return (
            <Pressable
              key={entry.id}
              onPress={() => router.push('/lookbook')}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.tile,
                { backgroundColor: entry.swatch },
                pressed && styles.pressed,
              ]}
            >
              {image ? <Image source={image} style={styles.bg} resizeMode="cover" /> : null}
              <View style={styles.scrim} />
              <View style={styles.caption}>
                <Text style={styles.tileTitle}>{entry.title}</Text>
                <Text style={styles.tileMeta}>{entry.caption}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={() => router.push('/lookbook')}
        accessibilityRole="button"
        style={({ pressed }) => [styles.viewAll, pressed && styles.pressed]}
      >
        <Text style={styles.viewAllText}>View lookbook</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.xxxl, paddingHorizontal: spacing.xl, gap: spacing.md },
  eyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.burntOrange,
    letterSpacing: 0.22,
    textTransform: 'uppercase',
  },
  title: { fontFamily: fonts.serif, fontSize: 26, color: colors.ink },
  lede: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.charcoal },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
  tile: {
    width: '48%',
    aspectRatio: 4 / 5,
    borderRadius: radii.sm,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  caption: { padding: spacing.lg, gap: 2 },
  tileTitle: { fontFamily: fonts.serif, fontSize: 16, color: colors.onDark },
  tileMeta: {
    fontFamily: fonts.sansMedium,
    fontSize: 9,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 0.18,
    textTransform: 'uppercase',
  },
  viewAll: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.charcoal,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  viewAllText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.ink,
    letterSpacing: 0.14,
    textTransform: 'uppercase',
  },
  pressed: { opacity: 0.85 },
});
