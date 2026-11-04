import { describe, expect, it } from "vitest";
import { classifyOffer, estimatePrice, marketEstimate } from "@/lib/estimate";
import { priceClassFor } from "@/lib/car-models";

const brakes = { estimatedHours: 1.3, typicalPartsSek: 1900 };

describe("estimatePrice", () => {
  it("computes the range from book time × tier rate band + parts multiplier", () => {
    const e = estimatePrice(brakes, "KEDJA");
    // labour 1.3 × 1400–1850, parts 1900 × 0.95–1.15, rounded to 10 kr
    expect(e.laborSek).toEqual({ low: 1820, high: 2410 });
    expect(e.partsSek).toEqual({ low: 1810, high: 2190 });
    expect(e.lowSek).toBe(3630);
    expect(e.highSek).toBe(4600);
    expect(e.typicalSek).toBe(4120);
  });

  it("ranks tiers: independent < chain < dealer", () => {
    const indep = estimatePrice(brakes, "FRISTAENDE").typicalSek;
    const chain = estimatePrice(brakes, "KEDJA").typicalSek;
    const dealer = estimatePrice(brakes, "MARKESVERKSTAD").typicalSek;
    expect(indep).toBeLessThan(chain);
    expect(chain).toBeLessThan(dealer);
  });

  it("makes premium cars more expensive", () => {
    expect(estimatePrice(brakes, "KEDJA", "PREMIUM").typicalSek).toBeGreaterThan(estimatePrice(brakes, "KEDJA").typicalSek);
  });

  it("handles labour-only jobs", () => {
    const e = estimatePrice({ estimatedHours: 0.7, typicalPartsSek: 0 }, "FRISTAENDE");
    expect(e.partsSek).toEqual({ low: 0, high: 0 });
    expect(e.lowSek).toBe(840);
  });

  it("market estimate spans independent low to dealer high", () => {
    const m = marketEstimate(brakes);
    expect(m.lowSek).toBe(estimatePrice(brakes, "FRISTAENDE").lowSek);
    expect(m.highSek).toBe(estimatePrice(brakes, "MARKESVERKSTAD").highSek);
  });
});

describe("classifyOffer", () => {
  const e = estimatePrice(brakes, "KEDJA"); // 3630–4600

  it("below the range is Billigt", () => {
    expect(classifyOffer(3000, e).verdict).toBe("BILLIGT");
  });

  it("inside the range is Bra värde", () => {
    expect(classifyOffer(3630, e).verdict).toBe("BRA_VARDE");
    expect(classifyOffer(4600, e).verdict).toBe("BRA_VARDE");
  });

  it("above the range is Dyrt", () => {
    const s = classifyOffer(6000, e);
    expect(s.verdict).toBe("DYRT");
    expect(s.diffFromTypicalPct).toBe(46);
    expect(s.positionInRange).toBe(1);
  });

  it("judges a dealer quote against dealer prices", () => {
    const dealer = estimatePrice(brakes, "MARKESVERKSTAD");
    expect(classifyOffer(5000, dealer).verdict).toBe("BRA_VARDE");
    expect(classifyOffer(5000, estimatePrice(brakes, "FRISTAENDE")).verdict).toBe("DYRT");
  });
});

describe("priceClassFor", () => {
  it("marks premium makes and models", () => {
    expect(priceClassFor("BMW", "3-serie")).toBe("PREMIUM");
    expect(priceClassFor("Volvo", "XC90")).toBe("PREMIUM");
    expect(priceClassFor("Volvo", "V60")).toBe("STANDARD");
    expect(priceClassFor("Toyota", "Corolla")).toBe("STANDARD");
  });
});
