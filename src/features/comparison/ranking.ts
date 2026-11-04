import type { SortMode, WorkshopChain, WorkshopTier } from "@/lib/domain";
import type { PriceEstimate } from "@/lib/estimate";

/** One real workshop with BilKoll's ESTIMATED price for one service. Pure data. */
export type Offer = {
  workshopId: string;
  workshopName: string;
  chain: WorkshopChain;
  tier: WorkshopTier;
  address: string;
  city: string;
  phone: string | null;
  website: string | null;
  estimate: PriceEstimate;
  distanceKm: number;
  isGodkandBilverkstad: boolean;
  isMrf: boolean;
  /** Authorised for the user's car make specifically. */
  isAuthorizedForMake: boolean;
};

export type RankedOffer = Offer & {
  /** 0–100, higher is better. Transparent weighted score, see VALUE_WEIGHTS. */
  valueScore: number;
};

export type ComparisonSummary = {
  offers: RankedOffer[];
  cheapestId: string | null;
  bestValueId: string | null;
  nearestId: string | null;
};

/** Shown to the user under "Så räknar vi" – keep in sync with the copy. */
export const VALUE_WEIGHTS = { price: 0.6, distance: 0.3, trust: 0.1 } as const;

const MAX_RELEVANT_KM = 30;
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function rankOffers(offers: readonly Offer[]): ComparisonSummary {
  const typicals = offers.map((o) => o.estimate.typicalSek);
  const min = typicals.length ? Math.min(...typicals) : 0;
  const max = typicals.length ? Math.max(...typicals) : 0;
  const span = max - min;

  const ranked: RankedOffer[] = offers.map((o) => {
    const price = span === 0 ? 1 : clamp01((max - o.estimate.typicalSek) / span);
    const distance = 1 - clamp01(o.distanceKm / MAX_RELEVANT_KM);
    const trust = o.isAuthorizedForMake || o.isGodkandBilverkstad || o.isMrf ? 1 : 0;
    const score = VALUE_WEIGHTS.price * price + VALUE_WEIGHTS.distance * distance + VALUE_WEIGHTS.trust * trust;
    return { ...o, valueScore: Math.round(score * 100) };
  });

  const first = (mode: SortMode) => sortOffers(ranked, mode)[0]?.workshopId ?? null;
  return {
    offers: ranked,
    cheapestId: first("LAGST_PRIS"),
    bestValueId: first("BAST_VARDE"),
    nearestId: first("NARMAST"),
  };
}

const byPrice = (a: RankedOffer, b: RankedOffer) =>
  a.estimate.typicalSek - b.estimate.typicalSek || a.distanceKm - b.distanceKm;
const byDistance = (a: RankedOffer, b: RankedOffer) => a.distanceKm - b.distanceKm || byPrice(a, b);
const byValue = (a: RankedOffer, b: RankedOffer) => b.valueScore - a.valueScore || byPrice(a, b);

export function sortOffers(offers: readonly RankedOffer[], mode: SortMode): RankedOffer[] {
  const copy = [...offers];
  switch (mode) {
    case "LAGST_PRIS":
      return copy.sort(byPrice);
    case "NARMAST":
      return copy.sort(byDistance);
    case "BAST_VARDE":
      return copy.sort(byValue);
  }
}
