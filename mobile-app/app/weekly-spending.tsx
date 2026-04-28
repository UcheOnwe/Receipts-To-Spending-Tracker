import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { BrandNav } from '@/components/BrandNav';
import { DataBottomNav } from '@/components/DataBottomNav';
import { ScreenShell } from '@/components/ScreenShell';
import { getReceipts } from '@/Services/api';
import { colors, fonts } from '@/theme/fonts';
import type { ReceiptDto } from '@/types/receipt';
import { formatUsd } from '@/utils/formatReceipt';
import { buildStoreShares } from '@/utils/spending';

const piePalette = ['#7F7F7F', '#B1B1B1', '#909090', '#C2C2C2', '#A0A0A0'];

export default function WeeklySpendingScreen() {
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
      setError(e instanceof Error ? e.message : 'Could not load weekly data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const shares = useMemo(() => buildStoreShares(receipts, 7), [receipts]);
  const pieData = useMemo(
    () =>
      shares.map((row, idx) => ({
        value: row.percentage,
        color: piePalette[idx % piePalette.length],
      })),
    [shares],
  );

  return (
    <ScreenShell>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <BrandNav />
          <Text style={styles.heading}>Money Spent</Text>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : error ? (
            <Text style={styles.emptyText}>{error}</Text>
          ) : shares.length > 0 ? (
            <>
              <View style={styles.chartWrap}>
                <PieChart data={pieData} radius={130} donut={false} strokeWidth={1} strokeColor="#FDFEFF" />
              </View>
              <View style={styles.legendWrap}>
                {shares.map((row, idx) => (
                  <View key={row.store} style={styles.legendRow}>
                    <View style={[styles.dot, { backgroundColor: piePalette[idx % piePalette.length] }]} />
                    <Text style={styles.legendText}>
                      {row.store}: {row.percentage}% ({formatUsd(row.amount)})
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>No weekly spending data yet. Add receipts to build your chart.</Text>
          )}
        </ScrollView>
        <DataBottomNav active="WeeklySpending" />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  scroll: { flexGrow: 1, paddingTop: 8, paddingBottom: 12 },
  heading: {
    marginTop: 12,
    marginBottom: 10,
    fontFamily: fonts.interBold,
    fontSize: 28,
    lineHeight: 34,
    color: colors.primary,
  },
  chartWrap: {
    marginTop: 6,
    alignItems: 'center',
  },
  legendWrap: {
    marginTop: 20,
    gap: 8,
    paddingBottom: 18,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendText: {
    fontFamily: fonts.interRegular,
    fontSize: 14,
    color: colors.textPrimary,
  },
  emptyText: {
    marginTop: 16,
    fontFamily: fonts.interRegular,
    fontSize: 18,
    color: colors.textSecondary,
  },
  loader: { marginTop: 22 },
});

