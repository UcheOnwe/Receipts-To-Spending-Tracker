import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { JacquesFrancois_400Regular } from '@expo-google-fonts/jacques-francois';
import { Kameron_700Bold } from '@expo-google-fonts/kameron';
import { Roboto_600SemiBold } from '@expo-google-fonts/roboto';
import { useFonts } from 'expo-font';
import * as ScreenCapture from 'expo-screen-capture';
import { useEffect } from 'react';
import { ActivityIndicator, InteractionManager, StyleSheet, View } from 'react-native';
import { setupTestUser } from '@/Services/api';
import { colors } from '@/theme/fonts';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Kameron_700Bold,
    JacquesFrancois_400Regular,
    Roboto_600SemiBold,
  });

  useEffect(() => {
    if (!loaded) {
      return;
    }
    void setupTestUser().catch(() => {
      /* Backend may be offline during UI-only dev */
    });
  }, [loaded]);

  useEffect(() => {
    if (!loaded) {
      return;
    }
    const task = InteractionManager.runAfterInteractions(() => {
      void ScreenCapture.allowScreenCaptureAsync().catch(() => {
        /* No-op if unsupported */
      });
    });
    return () => task.cancel();
  }, [loaded]);

  if (!loaded) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color="#173372" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
});
