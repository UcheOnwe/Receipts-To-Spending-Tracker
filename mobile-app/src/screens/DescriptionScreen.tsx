import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BrandNav } from '../components/BrandNav';
import { DataBottomNav } from '../components/DataBottomNav';
import { ScreenShell } from '../components/ScreenShell';
import { getReceipts } from '../services/api';
import { colors, fonts } from '../theme/fonts';
import type { ReceiptDto } from '../types/receipt';
import { buildStoreShares } from '../utils/spending';

export function DescriptionScreen() {
  const [receipts, setReceipts] = useState<ReceiptDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await Promise.race([
        getReceipts(),
        new Promise<ReceiptDto[]>((_, reject) => {
          setTimeout(() => reject(new Error('Request timed out. Please try again.')), 10000);
        }),
      ]);
      setReceipts(data);
    } catch (e) {
      setReceipts([]);
      setError(e instanceof Error ? e.message : 'Could not load spending advice.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const topStore = useMemo(() => buildStoreShares(receipts, 7)[0], [receipts]);

  return (
    <ScreenShell>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <BrandNav />
          <Text style={styles.heading}>Spending Advice</Text>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : error ? (
            <Text style={styles.body}>{error}</Text>
          ) : (
            <Text style={styles.body}>
              {topStore
                ? `Spend less at ${topStore.store}`
                : 'Start scanning receipts to see personalized spending advice.'}
            </Text>
          )}
        </ScrollView>
        <DataBottomNav active="Description" />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  scroll: { flexGrow: 1, paddingTop: 8, paddingBottom: 12 },
  heading: {
    marginTop: 12,
    fontFamily: fonts.interBold,
    fontSize: 28,
    lineHeight: 34,
    color: colors.primary,
  },
  body: {
    marginTop: 18,
    fontFamily: fonts.interRegular,
    fontSize: 18,
    lineHeight: 26,
    color: colors.black,
  },
  loader: { marginTop: 22 },
});
