import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BrandNav } from '@/components/BrandNav';
import { DataBottomNav } from '@/components/DataBottomNav';
import { ScreenShell } from '@/components/ScreenShell';
import { createReceipt, extractReceiptFromImage } from '@/Services/api';
import { colors, fonts } from '@/theme/fonts';
import { useRouter } from 'expo-router';

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
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(t);
  if (!m) {
    return null;
  }
  const mo = Number(m[1]);
  const d = Number(m[2]);
  const y = Number(m[3]);
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

export default function ScanScreen() {
  const router = useRouter();
  const [storeName, setStoreName] = useState('');
  const [totalText, setTotalText] = useState('');
  const [dateText, setDateText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractedItems, setExtractedItems] = useState<
    { itemName: string; price: number; quantity: number; category?: string }[]
  >([]);

  const computeTotal = useCallback(
    (items: { price: number; quantity: number }[]) =>
      items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0), 0),
    [],
  );

  const runExtraction = useCallback(
    async (imageUri: string) => {
      setExtracting(true);
      try {
        const extracted = await extractReceiptFromImage(imageUri);
        const store = String(extracted.store ?? '').trim();
        const items = Array.isArray(extracted.items) ? extracted.items : [];

        if (store && store.toLowerCase() !== 'no name found') {
          setStoreName(store);
        }
        setExtractedItems(items);

        const total = computeTotal(items);
        if (Number.isFinite(total) && total > 0) {
          setTotalText(String(Math.round(total * 100) / 100));
        }

        // If backend doesn't return a date, keep user field empty (optional).
      } catch (e) {
        Alert.alert(
          'Could not extract receipt',
          e instanceof Error ? e.message : 'Extraction failed. Make sure backend is running and reachable.',
        );
      } finally {
        setExtracting(false);
      }
    },
    [computeTotal],
  );

  const submitReceipt = useCallback(
    async (storeFallback: string) => {
      const store = storeName.trim() || storeFallback;
      const totalFromItems = extractedItems.length > 0 ? computeTotal(extractedItems) : 0;
      const normalized = totalText.trim().replace(',', '.');
      const totalFromInput = Number.parseFloat(normalized);
      const total = totalFromItems > 0 ? totalFromItems : totalFromInput;

      if ((Number.isNaN(total) || total <= 0) && extractedItems.length === 0) {
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
          'Leave date empty for today, or use format MM-DD-YYYY (example: 04-22-2026).',
        );
        return;
      }
      try {
        await createReceipt({
          store,
          date: dateIso,
          items:
            extractedItems.length > 0
              ? extractedItems.map((it) => ({
                  itemName: it.itemName,
                  price: Math.round(Number(it.price) * 100) / 100,
                  quantity: Number(it.quantity) || 1,
                  category: it.category ?? 'Other',
                }))
              : [
                  {
                    itemName: 'Receipt total',
                    price: Math.round((Number.isNaN(totalFromInput) ? 0 : totalFromInput) * 100) / 100,
                    quantity: 1,
                    category: 'Other',
                  },
                ],
        });
        router.replace('/view-receipt');
      } catch (e) {
        Alert.alert(
          'Could not save receipt',
          e instanceof Error ? e.message : 'Is the backend running? See API_SETUP.md.',
        );
      }
    },
    [router, storeName, totalText, dateText, extractedItems, computeTotal],
  );

  const handleTakePhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Camera permission', 'Allow camera access in Settings to take a receipt photo.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync(pickerOptions);
      if (!result.canceled && result.assets?.[0]) {
        await runExtraction(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Camera', 'Could not open the camera. Try again or use a physical device.');
    }
  }, [runExtraction]);

  const handlePickGallery = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Photos permission', 'Allow photo library access in Settings to upload a receipt image.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
      if (!result.canceled && result.assets?.[0]) {
        await runExtraction(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Photo library', 'Could not open your photos. Please try again.');
    }
  }, [runExtraction]);

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
            placeholder="MM-DD-YYYY — leave blank for today"
            placeholderTextColor={colors.textSecondary}
            value={dateText}
            onChangeText={setDateText}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={[styles.hint, styles.mb24]}>
            Upload a receipt photo to extract store name and items. Review the fields, then tap Save Receipt.
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
            <Pressable onPress={() => router.back()}>
              <Text style={[styles.actionText, styles.actionRight]}>Cancel</Text>
            </Pressable>
          </View>
        </ScrollView>
        {extracting ? (
          <View style={styles.loadingOverlay} pointerEvents="auto">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Extracting receipt…</Text>
          </View>
        ) : null}
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
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(253, 254, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: fonts.interSemi,
    fontSize: 16,
    color: colors.primary,
  },
});

