import { Image, StyleSheet, Text, View } from 'react-native';
import { APP_NAME, colors, fonts } from '../theme/fonts';

type Props = {
  title?: string;
  /** Tighter header row for dense screens (e.g. Sign up). */
  compact?: boolean;
};

export function BrandNav({ title = APP_NAME, compact = false }: Props) {
  return (
    <View style={[styles.nav, compact && styles.navCompact]}>
      <View style={[styles.titleArea, compact && styles.titleAreaCompact]}>
        <Text style={[styles.title, compact && styles.titleCompact]} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <Image
        source={require('../../assets/figma/receipt.png')}
        style={[styles.logo, compact && styles.logoCompact]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    width: '100%',
    minHeight: 69,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleArea: {
    flex: 1,
    paddingTop: 19,
    paddingRight: 8,
  },
  title: {
    fontFamily: fonts.kameronBold,
    fontSize: 32,
    lineHeight: 32,
    textAlign: 'center',
    color: colors.black,
  },
  logo: {
    width: 67,
    height: 67,
  },
  navCompact: {
    minHeight: 52,
    alignItems: 'center',
  },
  titleAreaCompact: {
    paddingTop: 6,
    paddingRight: 6,
  },
  titleCompact: {
    fontSize: 26,
    lineHeight: 28,
  },
  logoCompact: {
    width: 52,
    height: 52,
  },
});
