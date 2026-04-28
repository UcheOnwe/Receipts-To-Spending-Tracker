import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BrandNav } from '@/components/BrandNav';
import { ScreenShell } from '@/components/ScreenShell';
import { deleteReceipt, getReceiptById } from '@/Services/api';
import { colors, fonts } from '@/theme/fonts';
import type { ReceiptDto } from '@/types/receipt';
import { formatReceiptDate, formatUsd } from '@/utils/formatReceipt';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ReceiptDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ receiptId?: string }>();
  const receiptId = Number(params.receiptId);

  const [receipt, setReceipt] = useState<ReceiptDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      if (!Number.isFinite(receiptId)) {
        throw new Error('Invalid receipt id');
      }
      const data = await getReceiptById(receiptId);
      setReceipt(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load receipt');
      setReceipt(null);
    } finally {
      setLoading(false);
    }
  }, [receiptId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onDelete = useCallback(() => {
    Alert.alert('Delete receipt', 'Remove this receipt permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReceipt(receiptId);
            router.back();
          } catch (e) {
            Alert.alert('Error', e instanceof Error ? e.message : 'Delete failed');
          }
        },
      },
    ]);
  }, [router, receiptId]);

  return (
    <ScreenShell>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mb24}>
          <BrandNav />
        </View>
        <Text style={[styles.screenTitle, styles.mb24]}>Reciept Detail</Text>

        {loading ? (
          <View style={styles.centerBlock}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : null}

        {error ? (
          <View style={styles.mb24}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryBtn} onPress={() => void load()}>
              <Text style={styles.retryLabel}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {receipt && !loading ? (
          <>
            <Text style={[styles.detailLine, styles.mbRow]}>Store name: {receipt.store}</Text>
            <Text style={[styles.detailLine, styles.mbRow]}>Date: {formatReceiptDate(receipt.date)}</Text>
            <Text style={[styles.detailLine, styles.mbRow]}>
              Total: <Text style={styles.totalGreen}>{formatUsd(receipt.amount)}</Text>
            </Text>
            <View style={[styles.divider, styles.mbRow]} />
            <View style={styles.actions}>
              <Pressable onPress={() => router.replace('/scan')}>
                <Text style={styles.actionText}>Edit</Text>
              </Pressable>
              <Pressable onPress={onDelete}>
                <Text style={[styles.actionText, styles.actionRight]}>Delete</Text>
              </Pressable>
            </View>
          </>
        ) : null}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    alignItems: 'flex-start',
    paddingTop: 24,
    paddingBottom: 40,
  },
  mb24: {
    marginBottom: 24,
  },
  mbRow: {
    marginBottom: 24,
  },
  centerBlock: {
    width: '100%',
    paddingVertical: 24,
    alignItems: 'center',
  },
  errorText: {
    fontFamily: fonts.interSemi,
    fontSize: 16,
    color: '#991B1B',
  },
  retryBtn: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryLabel: {
    fontFamily: fonts.interSemi,
    color: '#fff',
    fontSize: 16,
  },
  screenTitle: {
    fontFamily: fonts.interBold,
    fontSize: 24,
    lineHeight: 32,
    color: colors.primary,
  },
  detailLine: {
    fontFamily: fonts.interSemi,
    fontSize: 20,
    lineHeight: 28,
    color: colors.black,
    alignSelf: 'stretch',
    maxWidth: 339,
  },
  totalGreen: {
    color: '#2ecc71',
    fontFamily: fonts.interBold,
  },
  divider: {
    width: '100%',
    maxWidth: 339,
    height: 1,
    backgroundColor: colors.black,
    alignSelf: 'stretch',
  },
  actions: {
    width: '100%',
    maxWidth: 342,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    minHeight: 70,
  },
  actionText: {
    fontFamily: fonts.jacques,
    fontSize: 24,
    lineHeight: 28,
    color: colors.black,
  },
  actionRight: {
    textAlign: 'right',
  },
});

