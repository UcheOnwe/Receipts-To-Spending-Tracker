import type { StackScreenProps } from '@react-navigation/stack';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandNav } from '../components/BrandNav';
import { ScreenShell } from '../components/ScreenShell';
import type { RootStackParamList } from '../navigation/types';
import { colors, fonts } from '../theme/fonts';

/** Balanced spacing: slightly tighter than Figma 24px gap, still fits one screen without scrolling. */
const BLOCK_GAP = 16;

type Props = StackScreenProps<RootStackParamList, 'SignUp'>;

export function SignUpScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <ScreenShell>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}
      >
        <View style={styles.column}>
          <BrandNav />

          <Text style={styles.label}>Full name:</Text>
          <TextInput style={styles.input} />

          <Text style={styles.label}>Email:</Text>
          <TextInput style={styles.input} autoCapitalize="none" />

          <Text style={styles.label}>Password:</Text>
          <TextInput style={styles.input} secureTextEntry={true} />

          <Text style={styles.label}>Re-enter Password:</Text>
          <TextInput style={styles.input} secureTextEntry={true} />

          <Pressable style={styles.primaryTap} onPress={() => navigation.navigate('Description')}>
            <Text style={styles.primaryText}>Sign up Your Account</Text>
          </Pressable>

          <Text style={styles.or}>Or</Text>
          <Pressable
            style={[styles.linkHit, styles.linkCenter, styles.loginFooter]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.linkWide}>Login</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  column: {
    flex: 1,
    alignItems: 'flex-start',
    gap: BLOCK_GAP,
    paddingTop: 16,
    paddingBottom: 0,
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
    alignSelf: 'stretch',
  },
  primaryTap: {
    width: '100%',
    maxWidth: 340,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
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
    alignSelf: 'center',
    fontFamily: fonts.interBold,
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    color: colors.black,
  },
  linkHit: {
    paddingVertical: 6,
  },
  linkCenter: {
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
    alignItems: 'center',
  },
  /** Space above system navigation / home indicator (not scrollable layout). */
  loginFooter: {
    marginBottom: 28,
  },
  linkWide: {
    width: '100%',
    maxWidth: 342,
    alignSelf: 'center',
    fontFamily: fonts.jacques,
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    color: colors.black,
  },
});
