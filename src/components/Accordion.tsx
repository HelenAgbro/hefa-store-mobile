import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing } from '@/theme';

/**
 * A list of questions that open to reveal their answer.
 *
 * One item is open at a time: the FAQ is long, and letting every panel stay
 * open would turn the screen into a wall of text with no way to see what is
 * where. Tapping an open question closes it again.
 *
 * The answer is rendered only while open rather than animated in, which keeps
 * the component free of any layout-animation dependency.
 */

export interface AccordionItem {
  id: string;
  question: string;
  answer: string;
}

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <View style={styles.list}>
      {items.map((item) => {
        const isOpen = item.id === openId;

        return (
          <View key={item.id} style={styles.item}>
            <Pressable
              onPress={() => setOpenId(isOpen ? null : item.id)}
              accessibilityRole="button"
              accessibilityState={{ expanded: isOpen }}
              style={({ pressed }) => [styles.header, pressed && styles.headerPressed]}
            >
              <Text style={styles.question}>{item.question}</Text>
              <Text style={styles.indicator}>{isOpen ? '−' : '+'}</Text>
            </Pressable>

            {isOpen ? <Text style={styles.answer}>{item.answer}</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  item: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  headerPressed: { opacity: 0.6 },
  question: {
    flex: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 15,
    lineHeight: 21,
    color: colors.ink,
  },
  indicator: {
    fontFamily: fonts.sans,
    fontSize: 20,
    color: colors.burntOrange,
  },
  answer: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: colors.charcoal,
    paddingBottom: spacing.lg,
    paddingRight: spacing.xl,
  },
});
