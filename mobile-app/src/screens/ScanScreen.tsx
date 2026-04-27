import { Ionicons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BrandNav } from '../components/BrandNav';
import { DataBottomNav } from '../components/DataBottomNav';
import { ScreenShell } from '../components/ScreenShell';
import type { RootStackParamList } from '../navigation/types';
import { createReceipt } from '../services/api';
import { colors, fonts } from '../theme/fonts';

type Props = StackScreenProps<RootStackParamList, 'Scan'>;

const OUTLINE_ICON_SIZE = 52;

const pickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  quality: 0.85,
  allowsEditing: false,
};

function parsePurchaseDateIso(raw: string): string | null {
  const t = raw.trim();
  if (!t) {
    return new Date().toISOString();
  }
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if (!m) {
    return null;
  }
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const date = new Date(Date.UTC(y, mo - 1, d, 12, 0, 0, 0));
  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== mo - 1 ||
    date.getUTCDate() !== d
  ) {
    return null;
  }
  return date.toISOString();
}

export function ScanScreen({ navigation }: Props) {
  const [storeName, setStoreName] = useState('');
  const [totalText, setTotalText] = useState('');
  const [dateText, setDateText] = useState('');

  const submitReceipt = useCallback(
    async (storeFallback: string) => {
      const store = storeName.trim() || storeFallback;
      const normalized = totalText.trim().replace(',', '.');
      const total = Number.parseFloat(normalized);
      if (Number.isNaN(total) || total <= 0) {
        Alert.alert(
          'Enter receipt total',
          'Charts use dollar amounts. Enter a total greater than 0 (for example 24.99), then save again.',
        );
        return;
      }
      const dateIso = parsePurchaseDateIso(dateText);
      if (dateIso === null) {
        Alert.alert(
          'Purchase date',
          'Leave date empty for today, or use format YYYY-MM-DD (example: 2026-04-22).',
        );
        return;
      }
      try {
        await createReceipt({
          store,
          date: dateIso,
          items: [
            {
              itemName: 'Receipt total',
              price: Math.round(total * 100) / 100,
              quantity: 1,
              category: 'Other',
            },
          ],
        });
        navigation.navigate('ViewReceipt');
      } catch (e) {
        Alert.alert(
          'Could not save receipt',
          e instanceof Error ? e.message : 'Is the backend running? See API_SETUP.md.',
        );
      }
    },
    [navigation, storeName, totalText, dateText],
  );

  const handleTakePhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera permission',
          'Allow camera access in Settings to take a receipt photo.',
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync(pickerOptions);
      if (!result.canceled && result.assets?.[0]) {
        await submitReceipt('Receipt (photo)');
      }
    } catch {
      Alert.alert('Camera', 'Could not open the camera. Try again or use a physical device.');
    }
  }, [submitReceipt]);

  const handlePickGallery = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Photos permission',
          'Allow photo library access in Settings to upload a receipt image.',
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
      if (!result.canceled && result.assets?.[0]) {
        await submitReceipt('Receipt (gallery)');
      }
    } catch {
      Alert.alert('Photo library', 'Could not open your photos. Please try again.');
    }
  }, [submitReceipt]);

  return (
    <ScreenShell>
      <View style={styles.container}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.mb24}>
            <BrandNav />
          </View>
          <Text style={[styles.screenTitle, styles.mb24]}>Scan Receipt</Text>

          <Text style={styles.fieldLabel}>Store name</Text>
          <TextInput
            style={[styles.input, styles.mb24]}
            placeholder="e.g. Walmart"
            placeholderTextColor={colors.textSecondary}
            value={storeName}
            onChangeText={setStoreName}
            autoCapitalize="words"
          />
          <Text style={styles.fieldLabel}>Receipt total (USD)</Text>
          <TextInput
            style={[styles.input, styles.mb24]}
            placeholder="e.g. 42.50"
            placeholderTextColor={colors.textSecondary}
            value={totalText}
            onChangeText={setTotalText}
            keyboardType="decimal-pad"
          />
          <Text style={styles.fieldLabel}>Purchase date (optional)</Text>
          <TextInput
            style={[styles.input, styles.mb24]}
            placeholder="YYYY-MM-DD — leave blank for today"
            placeholderTextColor={colors.textSecondary}
            value={dateText}
            onChangeText={setDateText}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={[styles.hint, styles.mb24]}>
            Photo upload does not read prices from the image yet. Enter the total so charts include this receipt. Use
            different dates (past week) to see multiple bars on Money Spent.
          </Text>

          <Pressable
            style={({ pressed }) => [styles.card, styles.mb24, pressed && styles.cardPressed]}
            onPress={handleTakePhoto}
            accessibilityRole="button"
            accessibilityLabel="Take a photo of your receipt"
          >
            <Text style={styles.cardHint}>Take a Photo</Text>
            <View style={styles.iconArea}>
              <Ionicons name="camera-outline" size={OUTLINE_ICON_SIZE} color={colors.black} />
            </View>
          </Pressable>
          <Text style={[styles.or, styles.mb24]}>Or</Text>
          <Pressable
            style={({ pressed }) => [styles.card, styles.mb24, pressed && styles.cardPressed]}
            onPress={handlePickGallery}
            accessibilityRole="button"
            accessibilityLabel="Upload a receipt image from gallery"
          >
            <Text style={[styles.cardHint, styles.cardHintTwoLines]}>
              Upload from{'\n'}Gallery
            </Text>
            <View style={styles.iconArea}>
              <Ionicons name="image-outline" size={OUTLINE_ICON_SIZE} color={colors.black} />
            </View>
          </Pressable>
          <View style={styles.actions}>
            <Pressable onPress={() => void submitReceipt('New receipt')}>
              <Text style={styles.actionText}>Save Receipt</Text>
            </Pressable>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={[styles.actionText, styles.actionRight]}>Cancel</Text>
            </Pressable>
          </View>
        </ScrollView>
        <DataBottomNav active="Scan" />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  scroll: {
    flexGrow: 1,
    alignItems: 'flex-start',
    paddingTop: 24,
    paddingBottom: 40,
  },
  mb24: {
    marginBottom: 24,
  },
  screenTitle: {
    fontFamily: fonts.interBold,
    fontSize: 24,
    lineHeight: 32,
    color: colors.primary,
  },
  fieldLabel: {
    width: '100%',
    maxWidth: 342,
    fontFamily: fonts.interRegular,
    fontSize: 16,
    lineHeight: 22,
    color: colors.black,
    marginBottom: 6,
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
  hint: {
    width: '100%',
    maxWidth: 342,
    fontFamily: fonts.interRegular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  card: {
    width: '100%',
    maxWidth: 342,
    minHeight: 199,
    backgroundColor: colors.greyBox,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardHint: {
    fontFamily: fonts.interRegular,
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  cardHintTwoLines: {
    lineHeight: 26,
  },
  /** Same footprint for both outline icons (camera + gallery). */
  iconArea: {
    marginTop: 4,
    minHeight: OUTLINE_ICON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  or: {
    width: '100%',
    maxWidth: 340,
    fontFamily: fonts.interBold,
    fontSize: 24,
    lineHeight: 32,
    textAlign: 'center',
    alignSelf: 'center',
    color: colors.black,
  },
  actions: {
    width: '100%',
    maxWidth: 342,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  actionText: {
    fontFamily: fonts.jacques,
    fontSize: 24,
    lineHeight: 34,
    color: colors.black,
  },
  actionRight: {
    textAlign: 'right',
  },
});
