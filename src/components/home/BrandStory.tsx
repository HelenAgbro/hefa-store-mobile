import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { getEditorialImage } from '@/lib/editorialImages';
import { colors, fonts, radii, spacing } from '@/theme';

/** Editorial brand-story band on a dark background. */
export function BrandStory() {
  const router = useRouter();
  const image = getEditorialImage('/images/hefa-story.jpg');

  return (
    <View style={styles.band}>
      <View style={styles.imageWrap}>
        {image ? <Image source={image} style={styles.bg} resizeMode="cover" /> : null}
      </View>

      <View style={styles.copy}>
        <Text style={styles.eyebrow}>The HEFA story</Text>
        <Text style={styles.title}>A Nigerian label built on restraint, craft and identity.</Text>
        <Text style={styles.body}>
          HEFA was founded on a simple idea: that a well-cut pair of pants can carry an entire
          wardrobe. We begin with the pants — a considered line made for professionals, for weekends,
          and for the space in between.
        </Text>
        <Text style={styles.body}>
          Every piece is designed in Lagos and produced in small runs, with fabrics chosen for the
          Nigerian climate and detailing that rewards a second look.
        </Text>
        <Pressable
          onPress={() => router.push('/about')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonText}>Read our story</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: { marginTop: spacing.xxxl, backgroundColor: colors.ink, padding: spacing.xl, gap: spacing.xl },
  imageWrap: {
    aspectRatio: 3 / 4,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.charcoal,
  },
  bg: { width: '100%', height: '100%' },
  copy: { gap: spacing.md },
  eyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.ochre,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  title: { fontFamily: fonts.serif, fontSize: 28, lineHeight: 34, color: colors.cream },
  body: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 22, color: 'rgba(246,242,234,0.8)' },
  button: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(246,242,234,0.5)',
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.cream,
    letterSpacing: 0.14,
    textTransform: 'uppercase',
  },
  pressed: { opacity: 0.85 },
});
