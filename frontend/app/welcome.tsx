import { Image, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { ScreenShell } from '@/components/ScreenShell';
import { APP_NAME, colors, fonts } from '@/theme/fonts';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScreenShell>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.welcomeLine, styles.mb12]}>Welcome to the</Text>
        <Text style={[styles.brandLine, styles.mb12]}>{APP_NAME}</Text>
        <Image source={require('../assets/figma/receipt.png')} style={[styles.hero, styles.mb12]} resizeMode="contain" />
        <Pressable style={({ pressed }) => [styles.cta, pressed && styles.pressed]} onPress={() => router.push('/new-user')}>
          <Text style={styles.ctaText}>Get started</Text>
        </Pressable>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingTop: 168,
    paddingBottom: 40,
    alignItems: 'center',
  },
  mb12: {
    marginBottom: 12,
  },
  welcomeLine: {
    width: '100%',
    maxWidth: 342,
    fontFamily: fonts.interBold,
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    color: colors.primary,
  },
  brandLine: {
    width: '100%',
    maxWidth: 342,
    fontFamily: fonts.kameronBold,
    fontSize: 36,
    lineHeight: 32,
    textAlign: 'center',
    color: colors.black,
  },
  hero: {
    width: '100%',
    maxWidth: 342,
    aspectRatio: 1,
    marginTop: 0,
  },
  cta: {
    width: '100%',
    maxWidth: 330,
    minHeight: 62,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  ctaText: {
    fontFamily: fonts.interBold,
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.7,
  },
});

