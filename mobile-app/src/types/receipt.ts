/** Matches C# ReceiptResponseDto / ReceiptItemResponseDto (camelCase JSON). */

export type ReceiptItemDto = {
  itemId: number;
  itemName: string;
  price: number;
  quantity: number;
  total: number;
  category: string;
};

export type ReceiptDto = {
  receiptId: number;
  store: string;
  amount: number;
  date: string;
  items: ReceiptItemDto[];
};

export type CreateReceiptItemPayload = {
  itemName: string;
  price: number;
  quantity: number;
  category?: string | null;
};

export type CreateReceiptPayload = {
  store: string;
  date: string;
  items: CreateReceiptItemPayload[];
};
