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
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, InteractionManager, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { setupTestUser } from './src/services/api';
import { colors } from './src/theme/fonts';

export default function App() {
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
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppNavigator />
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  boot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
});
