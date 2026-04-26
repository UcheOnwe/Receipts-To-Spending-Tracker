import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { BrandNav } from '../components/BrandNav';
import { DataBottomNav } from '../components/DataBottomNav';
import { ScreenShell } from '../components/ScreenShell';
import { getReceipts } from '../services/api';
import { colors, fonts } from '../theme/fonts';
import type { ReceiptDto } from '../types/receipt';
import { buildDailySpending } from '../utils/spending';

export function BarGraphScreen() {
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
      setError(e instanceof Error ? e.message : 'Could not load spending data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const daily = useMemo(() => buildDailySpending(receipts, 7), [receipts]);
  const chartData = useMemo(
    () =>
      daily.map((day) => ({
        value: day.total,
        label: day.label.slice(0, 1),
        frontColor: '#8E8E8E',
      })),
    [daily],
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
          ) : daily.every((d) => d.total <= 0) ? (
            <Text style={styles.emptyText}>No spending data yet. Scan and save receipts first.</Text>
          ) : (
            <View style={styles.chartWrap}>
              <BarChart
                data={chartData}
                barWidth={22}
                spacing={18}
                roundedTop
                yAxisThickness={0}
                xAxisThickness={0}
                noOfSections={4}
                maxValue={Math.max(10, ...daily.map((d) => d.total))}
                frontColor="#8F8F8F"
                hideRules
                hideYAxisText
                disableScroll
                initialSpacing={12}
              />
            </View>
          )}
        </ScrollView>
        <DataBottomNav active="BarGraph" />
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
    marginTop: 4,
    backgroundColor: '#DADADA',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontFamily: fonts.interRegular,
    fontSize: 16,
    color: colors.textSecondary,
  },
  loader: { marginTop: 22 },
});
