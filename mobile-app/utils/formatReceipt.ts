/** Receipt list/detail date (MM-DD-YYYY). */
export function formatReceiptDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return iso;
    }
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = String(d.getFullYear());
    return `${mm}-${dd}-${yyyy}`;
  } catch {
    return iso;
  }
}

/** Whole dollars + USD suffix (e.g. `10 USD`). */
export function formatUsd(amount: number): string {
  const n = Math.round(Number(amount));
  return `${n} USD`;
}

