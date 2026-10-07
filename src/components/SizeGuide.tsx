import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SIZE_ROWS } from '@/lib/size-guide';
import { colors, fonts, radii, spacing } from '@/theme';

/**
 * A "Size guide" link that opens a sheet of measurements.
 *
 * On the website this is a centred dialog; on a phone it rises from the bottom
 * so it reads as a native sheet and the close control stays within thumb reach.
 * The table is the same waist/hip/inseam grid, with each row a flex row rather
 * than a <table>, because React Native has no table element.
 */
export function SizeGuide() {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Open size guide"
        hitSlop={8}
      >
        <Text style={styles.link}>Size guide</Text>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        {/* Tapping the dimmed area behind the sheet closes it, the same as
            clicking outside the website's dialog. */}
        <Pressable
          style={styles.backdrop}
          onPress={() => setOpen(false)}
          accessibilityLabel="Close size guide"
        />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.xl }]}>
          <View style={styles.head}>
            <View>
              <Text style={styles.eyebrow}>Fit</Text>
              <Text style={styles.title}>Size guide</Text>
            </View>
            <Pressable
              onPress={() => setOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={12}
            >
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.body}>
            Measurements in centimetres. If you are between sizes, we recommend sizing up for a
            relaxed fit.
          </Text>

          <ScrollView style={styles.tableScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.tableHead}>
              <Text style={[styles.th, styles.colSize]}>Size</Text>
              <Text style={styles.th}>Waist</Text>
              <Text style={styles.th}>Hip</Text>
              <Text style={styles.th}>Inseam</Text>
            </View>

            {SIZE_ROWS.map((row) => (
              <View key={row.size} style={styles.tableRow}>
                <Text style={[styles.td, styles.colSize]}>{row.size}</Text>
                <Text style={styles.td}>{row.waist}</Text>
                <Text style={styles.td}>{row.hip}</Text>
                <Text style={styles.td}>{row.inseam}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  link: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.charcoal,
    letterSpacing: 0.14,
    textTransform: 'uppercase',
    textDecorationLine: 'underline',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '85%',
    backgroundColor: colors.cream,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  eyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.burntOrange,
    letterSpacing: 0.22,
    textTransform: 'uppercase',
  },
  title: { fontFamily: fonts.serif, fontSize: 24, color: colors.ink, marginTop: spacing.xs },
  close: { fontFamily: fonts.sans, fontSize: 20, color: colors.charcoal },
  body: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, color: colors.charcoal },
  tableScroll: { marginTop: spacing.sm },
  tableHead: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.25)',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  th: {
    flex: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: colors.muted,
    letterSpacing: 0.16,
    textTransform: 'uppercase',
  },
  td: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  colSize: { flex: 0.7 },
});
