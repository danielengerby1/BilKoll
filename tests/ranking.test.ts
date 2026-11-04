import { describe, expect, it } from "vitest";
import { rankOffers, sortOffers, type Offer } from "@/features/comparison/ranking";
import { estimatePrice } from "@/lib/estimate";
import type { WorkshopTier } from "@/lib/domain";

const service = { estimatedHours: 1.3, typicalPartsSek: 1900 };

function offer(id: string, tier: WorkshopTier, distanceKm: number, overrides: Partial<Offer> = {}): Offer {
  return {
    workshopId: id,
    workshopName: id,
    chain: "INDEPENDENT",
    tier,
    address: "Gatan 1",
    city: "Stockholm",
    phone: null,
    website: null,
    estimate: estimatePrice(service, tier),
    distanceKm,
    isGodkandBilverkstad: false,
    isMrf: false,
    isAuthorizedForMake: false,
    ...overrides,
  };
}

const offers = [
  offer("indep-far", "FRISTAENDE", 28),
  offer("chain-near", "KEDJA", 2),
  offer("dealer-nearest", "MARKESVERKSTAD", 1, { isAuthorizedForMake: true }),
  offer("indep-near", "FRISTAENDE", 6),
];

describe("rankOffers", () => {
  const s = rankOffers(offers);

  it("cheapest is the closest of the lowest-estimate workshops", () => {
    expect(s.cheapestId).toBe("indep-near");
  });

  it("nearest is by distance", () => {
    expect(s.nearestId).toBe("dealer-nearest");
  });

  it("best value balances estimated price and distance", () => {
    expect(s.bestValueId).toBe("indep-near");
  });

  it("handles an empty list", () => {
    expect(rankOffers([]).cheapestId).toBeNull();
  });
});

describe("sortOffers", () => {
  const { offers: ranked } = rankOffers(offers);

  it("sorts by estimated price, then distance", () => {
    expect(sortOffers(ranked, "LAGST_PRIS").map((o) => o.workshopId)).toEqual([
      "indep-near",
      "indep-far",
      "chain-near",
      "dealer-nearest",
    ]);
  });
});
