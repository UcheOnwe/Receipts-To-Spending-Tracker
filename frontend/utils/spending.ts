import type { ReceiptDto } from '@/types/receipt';

export type DaySpend = {
  label: string;
  isoDate: string;
  total: number;
};

export type StoreShare = {
  store: string;
  amount: number;
  percentage: number;
};

function toKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDate(value: string): Date | null {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function buildDailySpending(receipts: ReceiptDto[], days = 7): DaySpend[] {
  const now = new Date();
  const byDate = new Map<string, number>();

  receipts.forEach((receipt) => {
    const d = parseDate(receipt.date);
    if (!d) return;
    const key = toKey(d);
    byDate.set(key, (byDate.get(key) ?? 0) + Number(receipt.amount || 0));
  });

  const result: DaySpend[] = [];
  for (let idx = days - 1; idx >= 0; idx -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - idx);
    const key = toKey(d);
    result.push({
      isoDate: key,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      total: Number((byDate.get(key) ?? 0).toFixed(2)),
    });
  }
  return result;
}

export function buildStoreShares(receipts: ReceiptDto[], days = 7): StoreShare[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (days - 1));
  cutoff.setHours(0, 0, 0, 0);

  const byStore = new Map<string, number>();
  receipts.forEach((receipt) => {
    const d = parseDate(receipt.date);
    if (!d || d < cutoff) return;
    const store = receipt.store?.trim() || 'Unknown';
    byStore.set(store, (byStore.get(store) ?? 0) + Number(receipt.amount || 0));
  });

  const total = Array.from(byStore.values()).reduce((sum, value) => sum + value, 0);
  if (total <= 0) {
    return [];
  }

  return Array.from(byStore.entries())
    .map(([store, amount]) => ({
      store,
      amount: Number(amount.toFixed(2)),
      percentage: Number(((amount / total) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.amount - a.amount);
}

