import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BrandNav } from '../components/BrandNav';
import { DataBottomNav } from '../components/DataBottomNav';
import { ScreenShell } from '../components/ScreenShell';
import type { RootStackParamList } from '../navigation/types';
import { getApiBaseUrl, getReceipts } from '../services/api';
import { colors, fonts } from '../theme/fonts';
import type { ReceiptDto } from '../types/receipt';
import { formatReceiptDate, formatUsd } from '../utils/formatReceipt';

type Props = StackScreenProps<RootStackParamList, 'ViewReceipt'>;

export function ViewReceiptScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [receipts, setReceipts] = useState<ReceiptDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await getReceipts();
      setReceipts(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load receipts');
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return receipts;
    }
    return receipts.filter((r) => r.store.toLowerCase().includes(q));
  }, [receipts, query]);

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
          <Text style={[styles.screenTitle, styles.mb24]}>My Receipts</Text>
          <View style={[styles.searchWrap, styles.mb24]}>
          <Pressable
            style={styles.searchIconBtn}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
            hitSlop={8}
            onPress={() => {}}
          >
            <Ionicons name="menu-outline" size={22} color={colors.searchBarIcon} />
          </Pressable>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.searchIconEnd} pointerEvents="none">
            <Ionicons name="search-outline" size={22} color={colors.searchBarIcon} />
          </View>
        </View>

        {loading ? (
          <View style={styles.centerBlock}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : null}

        {error ? (
          <View style={[styles.errorBox, styles.mb24]}>
            <Text style={styles.errorText}>{error}</Text>
            <Text style={styles.errorHint}>API: {getApiBaseUrl()}</Text>
            <Pressable style={styles.retryBtn} onPress={() => void load()}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error && filtered.length === 0 ? (
          <Text style={styles.emptyText}>No receipts yet.</Text>
        ) : null}

          {filtered.map((item) => (
            <Pressable
              key={item.receiptId}
              style={({ pressed }) => [
                styles.card,
                styles.cardSpacing,
                pressed ? styles.cardPressed : undefined,
              ]}
              onPress={() => navigation.navigate('ReceiptDetails', { receiptId: item.receiptId })}
            >
              <Text style={styles.storeName}>{item.store}</Text>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Date:</Text>
                <Text style={styles.rowValue}>{formatReceiptDate(item.date)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Total Amount:</Text>
                <Text style={styles.totalValue}>{formatUsd(item.amount)}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
        <DataBottomNav active="ViewReceipt" />
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
  centerBlock: {
    width: '100%',
    paddingVertical: 24,
    alignItems: 'center',
  },
  errorBox: {
    width: '100%',
    maxWidth: 343,
    padding: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },
  errorText: {
    fontFamily: fonts.interSemi,
    fontSize: 16,
    color: '#991B1B',
  },
  errorHint: {
    marginTop: 8,
    fontFamily: fonts.interRegular,
    fontSize: 12,
    color: '#7F1D1D',
  },
  retryBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryText: {
    fontFamily: fonts.interSemi,
    fontSize: 16,
    color: '#fff',
  },
  emptyText: {
    fontFamily: fonts.interRegular,
    fontSize: 16,
    color: colors.textSecondary,
  },
  screenTitle: {
    fontFamily: fonts.interBold,
    fontSize: 24,
    lineHeight: 32,
    color: colors.primary,
  },
  searchWrap: {
    width: '100%',
    maxWidth: 328,
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.searchBg,
    borderRadius: 28,
    paddingLeft: 14,
    paddingRight: 16,
  },
  searchIconBtn: {
    paddingVertical: 8,
    paddingRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIconEnd: {
    paddingVertical: 8,
    paddingLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    fontFamily: fonts.interRegular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: colors.textPrimary,
    padding: 0,
    paddingVertical: 12,
  },
  cardSpacing: {
    marginBottom: 24,
  },
  card: {
    width: '100%',
    maxWidth: 343,
    minHeight: 123,
    backgroundColor: colors.viewReceiptCardBg,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.85,
  },
  storeName: {
    fontFamily: fonts.interSemi,
    fontSize: 20,
    lineHeight: 28,
    textAlign: 'center',
    color: colors.primary,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  rowLabel: {
    fontFamily: fonts.interSemi,
    fontSize: 20,
    lineHeight: 28,
    color: colors.textPrimary,
  },
  rowValue: {
    fontFamily: fonts.interSemi,
    fontSize: 20,
    lineHeight: 28,
    color: colors.textPrimary,
  },
  totalValue: {
    fontFamily: fonts.interBold,
    fontSize: 24,
    lineHeight: 32,
    color: colors.textPrimary,
  },
});
