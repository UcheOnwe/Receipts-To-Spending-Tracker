import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/fonts';
import { edgeMargin, topExtra } from '../theme/layout';

type Props = {
  children: ReactNode;
};

/**
 * Full-screen background (same as Figma) with safe-area + horizontal insets only.
 * No second “card” layer — one continuous white surface.
 */
export function ScreenShell({ children }: Props) {
  const insets = useSafeAreaInsets();

  const padLeft = Math.max(edgeMargin, insets.left);
  const padRight = Math.max(edgeMargin, insets.right);
  const padTop = insets.top + topExtra;
  const padBottom = Math.max(16, insets.bottom);

  return (
    <View
      style={[
        styles.shell,
        {
          paddingLeft: padLeft,
          paddingRight: padRight,
          paddingTop: padTop,
          paddingBottom: padBottom,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
