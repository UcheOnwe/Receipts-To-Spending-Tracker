import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { ScreenShell } from '@/components/ScreenShell';
import { APP_NAME, colors, fonts } from '@/theme/fonts';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <ScreenShell>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.brand, styles.mb24]}>{APP_NAME}</Text>
        <Image source={require('../assets/figma/receipt.png')} style={[styles.logo, styles.mb24]} resizeMode="contain" />
        <Text style={[styles.label, styles.mb24]}>Email:</Text>
        <TextInput
          style={[styles.input, styles.mb24]}
          placeholder=""
          placeholderTextColor="#999"
          autoCapitalize="none"
        />
        <Text style={[styles.label, styles.mb24]}>Password:</Text>
        <TextInput style={[styles.input, styles.mb24]} placeholder="" secureTextEntry={true} />
        <Pressable style={[styles.primaryTap, styles.mb24]} onPress={() => router.replace('/description')}>
          <Text style={styles.primaryText}>Log in to Your Account</Text>
        </Pressable>
        <Text style={[styles.or, styles.mb24]}>Or</Text>
        <Pressable style={styles.linkHit} onPress={() => router.push('/sign-up')}>
          <Text style={styles.linkWide}>Sign up</Text>
        </Pressable>
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
  linkHit: {
    paddingVertical: 6,
  },
  brand: {
    width: '100%',
    maxWidth: 342,
    fontFamily: fonts.kameronBold,
    fontSize: 32,
    lineHeight: 32,
    textAlign: 'center',
    color: colors.black,
  },
  logo: {
    width: 172,
    height: 172,
  },
  label: {
    width: '100%',
    maxWidth: 342,
    fontFamily: fonts.interRegular,
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'left',
    color: colors.black,
  },
  input: {
    width: '100%',
    maxWidth: 342,
    height: 46,
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontFamily: fonts.interRegular,
    fontSize: 16,
    color: colors.black,
  },
  primaryTap: {
    width: '100%',
    maxWidth: 340,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryText: {
    fontFamily: fonts.jacques,
    fontSize: 24,
    lineHeight: 28,
    textAlign: 'center',
    color: colors.black,
  },
  or: {
    width: '100%',
    maxWidth: 340,
    fontFamily: fonts.interBold,
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    color: colors.black,
  },
  linkWide: {
    width: '100%',
    maxWidth: 342,
    fontFamily: fonts.jacques,
    fontSize: 24,
    lineHeight: 34,
    textAlign: 'center',
    color: colors.black,
  },
});

