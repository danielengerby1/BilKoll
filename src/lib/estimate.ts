import {
  PRICE_CLASS_FACTOR,
  TIER_ESTIMATE,
  type AuditVerdict,
  type PriceClass,
  type WorkshopTier,
} from "./domain";

/**
 * BilKoll's price ESTIMATES. These are our calculation, never a workshop's
 * actual price: book time × the hourly-rate band for the workshop type, plus
 * typical parts cost × a parts multiplier. All SEK incl. moms.
 */

export type ServiceForEstimate = {
  /** Book time ("normaltid") for an average car. */
  estimatedHours: number;
  /** Typical parts/consumables for an average car, SEK incl. moms. */
  typicalPartsSek: number;
};

export type PriceEstimate = {
  lowSek: number;
  typicalSek: number;
  highSek: number;
  laborSek: { low: number; high: number };
  partsSek: { low: number; high: number };
  hours: number;
};

/** Estimates are shown rounded to 10 kr – they are not exact prices. */
const round10 = (n: number) => Math.round(n / 10) * 10;

export function estimatePrice(
  service: ServiceForEstimate,
  tier: WorkshopTier,
  priceClass: PriceClass = "STANDARD",
): PriceEstimate {
  const band = TIER_ESTIMATE[tier];
  const factor = PRICE_CLASS_FACTOR[priceClass];
  const hours = Math.round(service.estimatedHours * factor.hours * 10) / 10;
  const parts = service.typicalPartsSek * factor.parts;

  const laborLow = round10(hours * band.rateSek.min);
  const laborHigh = round10(hours * band.rateSek.max);
  const partsLow = round10(parts * band.parts.min);
  const partsHigh = round10(parts * band.parts.max);

  const lowSek = laborLow + partsLow;
  const highSek = laborHigh + partsHigh;
  return {
    lowSek,
    highSek,
    typicalSek: round10((lowSek + highSek) / 2),
    laborSek: { low: laborLow, high: laborHigh },
    partsSek: { low: partsLow, high: partsHigh },
    hours,
  };
}

/** Stockholm-wide standard price: cheapest independent to most expensive dealer, typical = chain. */
export function marketEstimate(service: ServiceForEstimate, priceClass: PriceClass = "STANDARD"): PriceEstimate {
  const indep = estimatePrice(service, "FRISTAENDE", priceClass);
  const chain = estimatePrice(service, "KEDJA", priceClass);
  const dealer = estimatePrice(service, "MARKESVERKSTAD", priceClass);
  return {
    lowSek: indep.lowSek,
    highSek: dealer.highSek,
    typicalSek: chain.typicalSek,
    laborSek: { low: indep.laborSek.low, high: dealer.laborSek.high },
    partsSek: { low: indep.partsSek.low, high: dealer.partsSek.high },
    hours: chain.hours,
  };
}

export type OfferSignal = {
  verdict: AuditVerdict;
  /** Offer vs the typical estimate, e.g. +18 means 18 % above. */
  diffFromTypicalPct: number;
  /** Where in the range the offer sits: 0 = low end, 1 = high end (clamped). */
  positionInRange: number;
};

/**
 * Below the range → Billigt, inside → Bra värde, above → Dyrt.
 * The range is the estimate for that workshop type, so a dealer isn't called
 * "dyrt" for charging dealer prices.
 */
export function classifyOffer(totalSek: number, estimate: PriceEstimate): OfferSignal {
  const verdict: AuditVerdict =
    totalSek < estimate.lowSek ? "BILLIGT" : totalSek <= estimate.highSek ? "BRA_VARDE" : "DYRT";
  const span = estimate.highSek - estimate.lowSek;
  const position = span > 0 ? (totalSek - estimate.lowSek) / span : 0.5;
  return {
    verdict,
    diffFromTypicalPct: estimate.typicalSek > 0 ? Math.round((totalSek / estimate.typicalSek - 1) * 100) : 0,
    positionInRange: Math.min(1, Math.max(0, position)),
  };
}
