/**
 * Receipt API client.
 *
 * - Physical device: set `EXPO_PUBLIC_API_URL`, e.g. `http://192.168.1.5:5001`
 * - Frontend-only testing: set `EXPO_PUBLIC_MOCK_API=1` to keep receipts in memory (no network).
 */

import { Platform } from 'react-native';

function isMockApi() {
  const v = process.env.EXPO_PUBLIC_MOCK_API?.trim?.().toLowerCase?.();
  return v === '1' || v === 'true' || v === 'yes';
}

let mockReceipts = [];
let mockNextId = 1;

function mockAmountFromItems(payload) {
  return (payload.items ?? []).reduce((sum, it) => sum + Number(it.price) * Number(it.quantity), 0);
}

function mockCreateReceipt(payload) {
  const items = (payload.items ?? []).map((it, idx) => {
    const price = Number(it.price);
    const qty = Number(it.quantity);
    return {
      itemId: idx + 1,
      itemName: String(it.itemName ?? ''),
      price,
      quantity: qty,
      total: price * qty,
      category: String(it.category ?? 'Other'),
    };
  });
  const receipt = {
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
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function resolveBaseUrl() {
  const env = process.env.EXPO_PUBLIC_API_URL?.trim?.();
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

async function apiFetch(input, init) {
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

function normalizeItem(raw) {
  return {
    itemId: Number(raw.itemId ?? raw.ItemId),
    itemName: String(raw.itemName ?? raw.ItemName ?? ''),
    price: Number(raw.price ?? raw.Price ?? 0),
    quantity: Number(raw.quantity ?? raw.Quantity ?? 0),
    total: Number(raw.total ?? raw.Total ?? 0),
    category: String(raw.category ?? raw.Category ?? ''),
  };
}

function normalizeReceipt(raw) {
  const itemsRaw = raw.items ?? raw.Items ?? [];
  return {
    receiptId: Number(raw.receiptId ?? raw.ReceiptId),
    store: String(raw.store ?? raw.Store ?? ''),
    amount: Number(raw.amount ?? raw.Amount ?? 0),
    date: String(raw.date ?? raw.Date ?? ''),
    items: Array.isArray(itemsRaw) ? itemsRaw.map((i) => normalizeItem(i)) : [],
  };
}

export async function setupTestUser() {
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

export async function getReceipts() {
  if (isMockApi()) {
    return [...mockReceipts];
  }
  const response = await apiFetch(`${BASE}/receipt`);
  if (!response.ok) {
    throw new ApiError('Failed to load receipts', response.status);
  }
  const data = await response.json();
  if (!Array.isArray(data)) {
    return [];
  }
  return data.map((row) => normalizeReceipt(row));
}

export async function getReceiptById(id) {
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
  const data = await response.json();
  return normalizeReceipt(data);
}

export async function createReceipt(payload) {
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
  const data = await response.json();
  return normalizeReceipt(data);
}

export async function deleteReceipt(id) {
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

function pickMimeType(uri) {
  const lower = String(uri || '').toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.heic')) return 'image/heic';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

/**
 * Upload receipt image to backend AI endpoint and return extracted CreateReceiptDto-like data:
 * { store: string, items: [{ itemName, price, quantity, category? }], date?: string }
 */
export async function extractReceiptFromImage(imageUri) {
  if (isMockApi()) {
    // Mock extraction: keep manual flow intact.
    return { store: '', items: [] };
  }

  if (!imageUri) {
    throw new ApiError('No image selected');
  }

  const form = new FormData();
  form.append('file', {
    uri: imageUri,
    name: `receipt-${Date.now()}.jpg`,
    type: pickMimeType(imageUri),
  });

  const response = await apiFetch(`${BASE}/ai/imageName`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      // NOTE: Do not set Content-Type manually for FormData in React Native.
    },
    body: form,
  });

  if (!response.ok) {
    const t = await response.text();
    throw new ApiError(t || 'Failed to extract receipt from image', response.status);
  }

  const data = await response.json();
  const itemsRaw = data.items ?? data.Items ?? [];

  const extracted = {
    store: String(data.store ?? data.Store ?? ''),
    date: data.date ?? data.Date,
    items: Array.isArray(itemsRaw)
      ? itemsRaw.map((it) => ({
          itemName: String(it.itemName ?? it.ItemName ?? ''),
          price: Number(it.price ?? it.Price ?? 0),
          quantity: Number(it.quantity ?? it.Quantity ?? 1),
          category: it.category ?? it.Category ?? undefined,
        }))
      : [],
  };

  return extracted;
}

export function getApiBaseUrl() {
  return BASE;
}

export default {
  setupTestUser,
  getReceipts,
  getReceiptById,
  createReceipt,
  deleteReceipt,
  extractReceiptFromImage,
  getApiBaseUrl,
};