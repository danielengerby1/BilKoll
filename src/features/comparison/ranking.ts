import type { SortMode } from "@/lib/domain";
import { median } from "@/lib/money";

/** One workshop's price for one service, flattened for comparison. Pure data, no Prisma types. */
export type Offer = {
  workshopId: string;
  workshopName: string;
  city: string;
  laborSek: number;
  partsSek: number;
  totalSek: number;
  noteSv: string | null;
  hourlyRateSek: number;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  nextAvailableAt: Date | null;
  isGodkandBilverkstad: boolean;
  isMrf: boolean;
  isAuthorized: boolean;
  /** Authorised for the user's car make specifically. */
  isAuthorizedForMake: boolean;
};

export type RankedOffer = Offer & {
  /** 0–100, higher is better. Transparent weighted score, see VALUE_WEIGHTS. */
  valueScore: number;
  /** Positive = cheaper than the median. */
  savingVsMedianSek: number;
  isPriceOutlier: boolean;
};

export type ComparisonSummary = {
  offers: RankedOffer[];
  medianTotalSek: number | null;
  minTotalSek: number | null;
  maxTotalSek: number | null;
  cheapestId: string | null;
  bestValueId: string | null;
  earliestId: string | null;
  nearestId: string | null;
};

/** Shown to the user under "Så räknar vi" – keep in sync with the copy. */
export const VALUE_WEIGHTS = { price: 0.5, rating: 0.2, distance: 0.15, trust: 0.1, availability: 0.05 } as const;

/** A price this far above the median is flagged. */
export const OUTLIER_FACTOR = 1.4;

const MAX_RELEVANT_KM = 30;
const MAX_RELEVANT_DAYS = 14;
/** Bayesian prior: pull ratings with few reviews toward 4.0. */
const PRIOR_RATING = 4.0;
const PRIOR_WEIGHT = 20;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function adjustedRating(rating: number, reviewCount: number): number {
  return (rating * reviewCount + PRIOR_RATING * PRIOR_WEIGHT) / (reviewCount + PRIOR_WEIGHT);
}

function daysFrom(now: Date, date: Date | null): number {
  if (!date) return MAX_RELEVANT_DAYS;
  return Math.max(0, (date.getTime() - now.getTime()) / 86_400_000);
}

export function rankOffers(offers: readonly Offer[], now: Date = new Date()): ComparisonSummary {
  const totals = offers.map((o) => o.totalSek);
  const med = median(totals);
  const min = totals.length ? Math.min(...totals) : null;
  const max = totals.length ? Math.max(...totals) : null;
  const priceSpan = min !== null && max !== null ? max - min : 0;

  const ranked: RankedOffer[] = offers.map((o) => {
    const price = priceSpan === 0 ? 1 : clamp01(((max ?? 0) - o.totalSek) / priceSpan);
    const rating = clamp01((adjustedRating(o.rating, o.reviewCount) - 3) / 2);
    const distance = 1 - clamp01(o.distanceKm / MAX_RELEVANT_KM);
    const trust = (o.isGodkandBilverkstad ? 0.5 : 0) + (o.isMrf ? 0.3 : 0) + (o.isAuthorizedForMake ? 0.2 : 0);
    const availability = 1 - clamp01(daysFrom(now, o.nextAvailableAt) / MAX_RELEVANT_DAYS);
    const score =
      VALUE_WEIGHTS.price * price +
      VALUE_WEIGHTS.rating * rating +
      VALUE_WEIGHTS.distance * distance +
      VALUE_WEIGHTS.trust * trust +
      VALUE_WEIGHTS.availability * availability;
    return {
      ...o,
      valueScore: Math.round(score * 100),
      savingVsMedianSek: med === null ? 0 : med - o.totalSek,
      isPriceOutlier: med !== null && o.totalSek > med * OUTLIER_FACTOR,
    };
  });

  const pick = (cmp: (a: RankedOffer, b: RankedOffer) => number) => [...ranked].sort(cmp)[0]?.workshopId ?? null;

  return {
    offers: ranked,
    medianTotalSek: med,
    minTotalSek: min,
    maxTotalSek: max,
    cheapestId: pick(byPrice),
    bestValueId: pick(byValue),
    earliestId: pick((a, b) => daysFrom(now, a.nextAvailableAt) - daysFrom(now, b.nextAvailableAt) || byPrice(a, b)),
    nearestId: pick((a, b) => a.distanceKm - b.distanceKm || byPrice(a, b)),
  };
}

const byPrice = (a: RankedOffer, b: RankedOffer) => a.totalSek - b.totalSek || b.valueScore - a.valueScore;
const byValue = (a: RankedOffer, b: RankedOffer) => b.valueScore - a.valueScore || a.totalSek - b.totalSek;

export function sortOffers(offers: readonly RankedOffer[], mode: SortMode, now: Date = new Date()): RankedOffer[] {
  const copy = [...offers];
  switch (mode) {
    case "LAGST_PRIS":
      return copy.sort(byPrice);
    case "NARMAST":
      return copy.sort((a, b) => a.distanceKm - b.distanceKm || byPrice(a, b));
    case "TIDIGAST":
      return copy.sort((a, b) => daysFrom(now, a.nextAvailableAt) - daysFrom(now, b.nextAvailableAt) || byPrice(a, b));
    case "BETYG":
      return copy.sort((a, b) => adjustedRating(b.rating, b.reviewCount) - adjustedRating(a.rating, a.reviewCount));
    case "BAST_VARDE":
      return copy.sort(byValue);
  }
}
