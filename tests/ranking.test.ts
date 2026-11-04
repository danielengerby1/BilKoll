import { describe, expect, it } from "vitest";
import { adjustedRating, rankOffers, sortOffers, type Offer } from "@/features/comparison/ranking";

const now = new Date("2026-11-04T08:00:00Z");
const inDays = (d: number) => new Date(now.getTime() + d * 86_400_000);

function offer(id: string, overrides: Partial<Offer>): Offer {
  return {
    workshopId: id,
    workshopName: id,
    city: "Stockholm",
    laborSek: 2000,
    partsSek: 1000,
    totalSek: 3000,
    noteSv: null,
    hourlyRateSek: 1600,
    distanceKm: 5,
    rating: 4.5,
    reviewCount: 100,
    nextAvailableAt: inDays(3),
    isGodkandBilverkstad: true,
    isMrf: false,
    isAuthorized: false,
    isAuthorizedForMake: false,
    ...overrides,
  };
}

const offers = [
  offer("cheap-bad", { totalSek: 2000, rating: 3.2, reviewCount: 200, distanceKm: 25, isGodkandBilverkstad: false }),
  offer("good-value", { totalSek: 2400, rating: 4.7, reviewCount: 300, distanceKm: 4, isMrf: true }),
  offer("expensive", { totalSek: 5000, rating: 4.8, reviewCount: 50, distanceKm: 1, nextAvailableAt: inDays(0) }),
  offer("mid", { totalSek: 3000 }),
];

describe("rankOffers", () => {
  const summary = rankOffers(offers, now);

  it("finds cheapest, nearest and earliest", () => {
    expect(summary.cheapestId).toBe("cheap-bad");
    expect(summary.nearestId).toBe("expensive");
    expect(summary.earliestId).toBe("expensive");
  });

  it("best value balances price with quality", () => {
    expect(summary.bestValueId).toBe("good-value");
  });

  it("computes median and savings", () => {
    expect(summary.medianTotalSek).toBe(2700);
    const good = summary.offers.find((o) => o.workshopId === "good-value");
    expect(good?.savingVsMedianSek).toBe(300);
  });

  it("flags price outliers", () => {
    expect(summary.offers.find((o) => o.workshopId === "expensive")?.isPriceOutlier).toBe(true);
    expect(summary.offers.find((o) => o.workshopId === "mid")?.isPriceOutlier).toBe(false);
  });

  it("handles an empty list", () => {
    const empty = rankOffers([], now);
    expect(empty.cheapestId).toBeNull();
    expect(empty.medianTotalSek).toBeNull();
  });
});

describe("sortOffers", () => {
  const { offers: ranked } = rankOffers(offers, now);

  it("sorts by price", () => {
    expect(sortOffers(ranked, "LAGST_PRIS", now).map((o) => o.workshopId)).toEqual([
      "cheap-bad",
      "good-value",
      "mid",
      "expensive",
    ]);
  });

  it("sorts by distance", () => {
    expect(sortOffers(ranked, "NARMAST", now)[0]?.workshopId).toBe("expensive");
  });
});

describe("adjustedRating", () => {
  it("pulls ratings with few reviews toward the prior", () => {
    expect(adjustedRating(5, 1)).toBeLessThan(4.1);
    expect(adjustedRating(5, 1000)).toBeGreaterThan(4.9);
  });
});
