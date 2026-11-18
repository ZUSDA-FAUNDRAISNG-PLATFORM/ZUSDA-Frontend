/** Digits-only parse; returns 0 for empty/invalid. */
export function parseKesInput(raw: string): number {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return 0;
  const value = Number(digits);
  return Number.isFinite(value) ? value : 0;
}

/** Format integer KES with grouping while typing (no decimals). */
export function formatKesInput(raw: string): string {
  const value = parseKesInput(raw);
  if (!raw.replace(/[^\d]/g, "")) return "";
  return value.toLocaleString("en-KE");
}

export function formatKes(amount: number): string {
  return `KES ${Math.max(0, Math.round(amount)).toLocaleString("en-KE")}`;
}
