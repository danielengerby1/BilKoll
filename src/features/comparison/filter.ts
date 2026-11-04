import type { WorkshopFilter } from "@/lib/domain";

/** Pure filtering rules for which workshops to show. Unit-tested. */

export type FilterableWorkshop = { isAuthorized: boolean; authorizedMakes: string | null };

export function parseMakes(authorizedMakes: string | null): string[] {
  return (authorizedMakes ?? "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
}

export function isAuthorizedFor(authorizedMakes: string | null, make: string | null): boolean {
  if (!make) return false;
  const wanted = make.toLowerCase();
  return parseMakes(authorizedMakes).some((m) => m.toLowerCase() === wanted);
}

/**
 * - OBEROENDE: chains and independents only.
 * - MARKE: brand workshops only – for the chosen make, or all of them without a make.
 * - ALLA: chains/independents + brand workshops for the chosen make. Without a
 *   make we hide brand workshops, since a Kia dealer is irrelevant to a Volvo owner.
 */
export function shouldShowWorkshop(w: FilterableWorkshop, filter: WorkshopFilter, make: string | null): boolean {
  if (!w.isAuthorized) return filter !== "MARKE";
  if (filter === "OBEROENDE") return false;
  if (!make) return filter === "MARKE";
  return isAuthorizedFor(w.authorizedMakes, make);
}

/** Distinct makes across brand workshops, sorted for the brand picker. */
export function collectMakes(workshops: readonly FilterableWorkshop[]): string[] {
  const set = new Set<string>();
  for (const w of workshops) if (w.isAuthorized) for (const m of parseMakes(w.authorizedMakes)) set.add(m);
  return [...set].sort((a, b) => a.localeCompare(b, "sv"));
}
