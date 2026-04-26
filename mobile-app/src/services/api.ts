/**
 * Receipt API client — matches team backend `ReceiptController` (no server edits from this app).
 * Physical device: set EXPO_PUBLIC_API_URL, e.g. http://192.168.1.5:5001
 *
 * Frontend-only testing: set EXPO_PUBLIC_MOCK_API=1 — keeps receipts in memory (no network).
 */
import { Platform } from 'react-native';
import type { CreateReceiptPayload, ReceiptDto, ReceiptItemDto } from '../types/receipt';

function isMockApi(): boolean {
  const v = process.env.EXPO_PUBLIC_MOCK_API?.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

let mockReceipts: ReceiptDto[] = [];
let mockNextId = 1;

function mockAmountFromItems(payload: CreateReceiptPayload): number {
  return payload.items.reduce((sum, it) => sum + Number(it.price) * Number(it.quantity), 0);
}

function mockCreateReceipt(payload: CreateReceiptPayload): ReceiptDto {
  const items: ReceiptItemDto[] = payload.items.map((it, idx) => {
    const price = Number(it.price);
    const qty = Number(it.quantity);
    return {
      itemId: idx + 1,
      itemName: it.itemName,
      price,
      quantity: qty,
      total: price * qty,
      category: String(it.category ?? 'Other'),
    };
  });
  const receipt: ReceiptDto = {
    receiptId: mockNextId++,
    store: payload.store,
    amount: mockAmountFromItems(payload),
    date: payload.date,
    items,
  };
  mockReceipts = [receipt, ...mockReceipts];
  return receipt;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function resolveBaseUrl(): string {
  const env = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (env) {
    const base = env.replace(/\/$/, '');
    return base.endsWith('/api') ? base : `${base}/api`;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5001/api';
  }
  return 'http://127.0.0.1:5001/api';
}

const BASE = isMockApi() ? 'mock://receipts' : resolveBaseUrl();

/** Wraps fetch so low-level connection failures show a clear message (not confused with OCR/image). */
async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('Network request failed') || msg.includes('Failed to fetch')) {
      throw new ApiError(
        `Cannot reach API (${BASE}). Phone and PC must be on the same Wi‑Fi, backend must be running (dotnet run), and EXPO_PUBLIC_API_URL must match this PC. This error is not because the image was not a receipt.`,
      );
    }
    throw e;
  }
}

function normalizeItem(raw: Record<string, unknown>): ReceiptItemDto {
  return {
    itemId: Number(raw.itemId ?? raw.ItemId),
    itemName: String(raw.itemName ?? raw.ItemName ?? ''),
    price: Number(raw.price ?? raw.Price ?? 0),
    quantity: Number(raw.quantity ?? raw.Quantity ?? 0),
    total: Number(raw.total ?? raw.Total ?? 0),
    category: String(raw.category ?? raw.Category ?? ''),
  };
}

function normalizeReceipt(raw: Record<string, unknown>): ReceiptDto {
  const itemsRaw = (raw.items ?? raw.Items ?? []) as Record<string, unknown>[];
  return {
    receiptId: Number(raw.receiptId ?? raw.ReceiptId),
    store: String(raw.store ?? raw.Store ?? ''),
    amount: Number(raw.amount ?? raw.Amount ?? 0),
    date: String(raw.date ?? raw.Date ?? ''),
    items: Array.isArray(itemsRaw) ? itemsRaw.map((i) => normalizeItem(i)) : [],
  };
}

/** Ensures UserId = 1 exists (backend test user). Safe to call multiple times. */
export async function setupTestUser(): Promise<void> {
  if (isMockApi()) {
    return;
  }
  const url = `${BASE}/receipt/setup-test-user`;
  const response = await apiFetch(url, { method: 'POST' });
  if (!response.ok) {
    const t = await response.text();
    throw new ApiError(t || 'setup-test-user failed', response.status);
  }
}

export async function getReceipts(): Promise<ReceiptDto[]> {
  if (isMockApi()) {
    return [...mockReceipts];
  }
  const response = await apiFetch(`${BASE}/receipt`);
  if (!response.ok) {
    throw new ApiError('Failed to load receipts', response.status);
  }
  const data = (await response.json()) as unknown;
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map((row) => normalizeReceipt(row as Record<string, unknown>));
}

export async function getReceiptById(id: number): Promise<ReceiptDto> {
  if (isMockApi()) {
    const r = mockReceipts.find((x) => x.receiptId === id);
    if (!r) {
      throw new ApiError('Receipt not found', 404);
    }
    return { ...r, items: r.items.map((i) => ({ ...i })) };
  }
  const response = await apiFetch(`${BASE}/receipt/${id}`);
  if (response.status === 404) {
    throw new ApiError('Receipt not found', 404);
  }
  if (!response.ok) {
    throw new ApiError('Failed to load receipt', response.status);
  }
  const data = (await response.json()) as Record<string, unknown>;
  return normalizeReceipt(data);
}

export async function createReceipt(payload: CreateReceiptPayload): Promise<ReceiptDto> {
  if (isMockApi()) {
    return mockCreateReceipt(payload);
  }
  const response = await apiFetch(`${BASE}/receipt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const t = await response.text();
    throw new ApiError(t || 'Failed to create receipt', response.status);
  }
  const data = (await response.json()) as Record<string, unknown>;
  return normalizeReceipt(data);
}

export async function deleteReceipt(id: number): Promise<void> {
  if (isMockApi()) {
    const before = mockReceipts.length;
    mockReceipts = mockReceipts.filter((x) => x.receiptId !== id);
    if (mockReceipts.length === before) {
      throw new ApiError('Receipt not found', 404);
    }
    return;
  }
  const response = await apiFetch(`${BASE}/receipt/${id}`, { method: 'DELETE' });
  if (response.status === 404) {
    throw new ApiError('Receipt not found', 404);
  }
  if (!response.ok) {
    throw new ApiError('Failed to delete receipt', response.status);
  }
}

export function getApiBaseUrl(): string {
  return BASE;
}
