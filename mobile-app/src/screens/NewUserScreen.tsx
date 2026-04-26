import type { StackScreenProps } from '@react-navigation/stack';
import { Image, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';
import type { RootStackParamList } from '../navigation/types';
import { APP_NAME, colors, fonts } from '../theme/fonts';

type Props = StackScreenProps<RootStackParamList, 'NewUser'>;

export function NewUserScreen({ navigation }: Props) {
  return (
    <ScreenShell>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.brand, styles.mb24]}>{APP_NAME}</Text>
        <Image
          source={require('../../assets/figma/receipt.png')}
          style={[styles.logo, styles.mb24]}
          resizeMode="contain"
        />
        <Text style={[styles.h2, styles.mb24]}>Already have an account?</Text>
        <Pressable style={[styles.mb24, styles.linkHit]} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Login</Text>
        </Pressable>
        <Text style={[styles.or, styles.mb24]}>Or</Text>
        <Text style={[styles.h2, styles.mb24]}>New to Receipt Tracker?</Text>
        <Pressable style={[styles.mb24, styles.linkHit]} onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.link}>Signup</Text>
        </Pressable>
        <Text style={styles.quote}>
          Your spending habits shape your future. Track every receipt and turn your expenses into smarter decisions.
        </Text>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 40,
  },
  mb24: {
    marginBottom: 24,
  },
  brand: {
    width: '100%',
    maxWidth: 342,
    fontFamily: fonts.kameronBold,
    fontSize: 32,
    lineHeight: 32,
    textAlign: 'center',
    color: colors.black,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 4,
  },
  logo: {
    width: 172,
    height: 172,
  },
  h2: {
    fontFamily: fonts.interSemi,
    fontSize: 20,
    lineHeight: 28,
    textAlign: 'center',
    color: colors.black,
  },
  or: {
    fontFamily: fonts.interBold,
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    color: colors.black,
  },
  linkHit: {
    paddingVertical: 6,
  },
  link: {
    fontFamily: fonts.jacques,
    fontSize: 24,
    lineHeight: 34,
    textAlign: 'center',
    color: colors.black,
  },
  quote: {
    width: '100%',
    maxWidth: 288,
    fontFamily: fonts.robotoSemi,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0.15,
    color: colors.primary,
  },
});
