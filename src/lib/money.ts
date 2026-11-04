/** All money is whole SEK incl. 25 % moms. */

export const MOMS_RATE = 0.25;

const sekFormatter = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

/** The only allowed way to show a price. "1 990 kr". */
export function formatSek(amountSek: number): string {
  return sekFormatter.format(Math.round(amountSek)).replace(/ /g, " ");
}

/** Round to whole kronor – use whenever arithmetic could produce decimals. */
export function toSek(value: number): number {
  return Math.round(value);
}

export function sumSek(...amounts: number[]): number {
  return amounts.reduce((acc, n) => acc + n, 0);
}

/** Labour cost = hours × hourly rate, rounded to whole SEK. */
export function laborCostSek(hours: number, hourlyRateSek: number): number {
  return toSek(hours * hourlyRateSek);
}

export function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid] ?? null;
  const lo = sorted[mid - 1];
  const hi = sorted[mid];
  return lo === undefined || hi === undefined ? null : toSek((lo + hi) / 2);
}

/**
 * Parse a Swedish-formatted amount from user input: "1 990", "1.990", "1990 kr", "1 990,00".
 * Returns null when it isn't a non-negative number.
 */
export function parseSekInput(raw: string): number | null {
  const cleaned = raw
    .replace(/kr|sek|:-/gi, "")
    .replace(/[\s ]/g, "")
    .replace(/,(\d{1,2})$/, ".$1")
    .replace(/\.(?=\d{3}(\D|$))/g, "");
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? toSek(n) : null;
}
