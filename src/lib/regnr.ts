/**
 * Swedish registration numbers: three letters + three digits ("ABC123"),
 * or the 2019+ format where the last character may be a letter ("ABC12D").
 * I, Q and V are not used in the letter part; the last letter cannot be O.
 */
const REGNR_PATTERN = /^[A-HJ-PR-UW-Z]{3}\d{2}[\dA-HJ-NPR-UW-Z]$/;

/** Uppercase, strip spaces and dashes. Always call before storing or looking up. */
export function normalizeRegnr(input: string): string {
  return input.toUpperCase().replace(/[\s-]/g, "");
}

export function isValidRegnr(input: string): boolean {
  return REGNR_PATTERN.test(normalizeRegnr(input));
}

/** "ABC123" → "ABC 123". */
export function formatRegnr(regnr: string): string {
  const n = normalizeRegnr(regnr);
  return n.length === 6 ? `${n.slice(0, 3)} ${n.slice(3)}` : n;
}
