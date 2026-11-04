import { describe, expect, it } from "vitest";
import { auditQuote, computeFairRange, findUpsellKeywords, mergeVerdicts } from "@/features/quote-audit/audit";
import { detectSafetyTopics } from "@/features/ai-mechanic/safety";

const brakesBench = {
  estimatedHours: 1.3,
  marketTotalsSek: [3300, 3800, 4000, 4200, 4600, 5900],
  marketPartsSek: [1800, 1900, 2000],
};

describe("auditQuote", () => {
  it("rates a market-level quote as reasonable", () => {
    const r = auditQuote({ quotedHours: 1.3, quotedLaborSek: 2100, quotedPartsSek: 1900, rawText: null }, brakesBench);
    expect(r.verdict).toBe("RIMLIGT");
    expect(r.benchmarkTotalSek).toBe(4100);
    expect(r.quotedTotalSek).toBe(4000);
  });

  it("rates a moderately high quote as NAGOT_HOGT", () => {
    const r = auditQuote({ quotedHours: 1.3, quotedLaborSek: 2900, quotedPartsSek: 2100, rawText: null }, brakesBench);
    expect(r.verdict).toBe("NAGOT_HOGT");
  });

  it("rates a very high quote as FOR_HOGT", () => {
    const r = auditQuote({ quotedHours: 1.5, quotedLaborSek: 3500, quotedPartsSek: 3500, rawText: null }, brakesBench);
    expect(r.verdict).toBe("FOR_HOGT");
    expect(r.findings.map((f) => f.code)).toContain("PARTS_ABOVE_MARKET");
    expect(r.findings.map((f) => f.code)).toContain("HOURLY_RATE_ABOVE_BAND");
  });

  it("flags padded hours plus a higher price as suspected upsell", () => {
    const r = auditQuote({ quotedHours: 3, quotedLaborSek: 3000, quotedPartsSek: 1900, rawText: null }, brakesBench);
    expect(r.verdict).toBe("MISSTANKT_MERFORSALJNING");
  });

  it("flags upsell keywords in the quote text", () => {
    const r = auditQuote(
      { quotedHours: 1.5, quotedLaborSek: 2600, quotedPartsSek: 2200, rawText: "Bromsar fram. Rekommenderas: motorrengöring" },
      brakesBench,
    );
    expect(r.verdict).toBe("MISSTANKT_MERFORSALJNING");
  });

  it("works without a benchmark", () => {
    const r = auditQuote({ quotedHours: 1, quotedLaborSek: 1500, quotedPartsSek: 0, rawText: null }, null);
    expect(r.verdict).toBe("RIMLIGT");
    expect(r.benchmarkTotalSek).toBeNull();
    expect(r.findings.map((f) => f.code)).toContain("NO_BENCHMARK");
  });

  it("computes the fair range from book time × rate band + parts", () => {
    expect(computeFairRange(brakesBench)).toEqual({ low: 1560 + 1900, high: 2860 + 1900, typical: 2145 + 1900 });
  });
});

describe("mergeVerdicts", () => {
  it("lets AI escalate but never soften", () => {
    expect(mergeVerdicts("RIMLIGT", "MISSTANKT_MERFORSALJNING")).toBe("MISSTANKT_MERFORSALJNING");
    expect(mergeVerdicts("FOR_HOGT", "RIMLIGT")).toBe("FOR_HOGT");
    expect(mergeVerdicts("NAGOT_HOGT", null)).toBe("NAGOT_HOGT");
  });
});

describe("findUpsellKeywords", () => {
  it("is case-insensitive", () => {
    expect(findUpsellKeywords("ADDITIV i tanken")).toEqual(["additiv"]);
    expect(findUpsellKeywords(null)).toEqual([]);
  });
});

describe("detectSafetyTopics", () => {
  it("detects brake, steering and fuel problems", () => {
    expect(detectSafetyTopics("Bromspedalen sjunker mot golvet")).toContain("BROMSAR");
    expect(detectSafetyTopics("Ratten vibrerar i 100 km/h")).toContain("STYRNING");
    expect(detectSafetyTopics("Det luktar bensin i kupén")).toContain("BRANSLE");
    expect(detectSafetyTopics("oljelampan lyser rött")).toContain("VARNINGSLAMPA");
  });

  it("does not trigger on everyday questions", () => {
    expect(detectSafetyTopics("När ska jag byta till vinterdäck?")).toEqual([]);
    expect(detectSafetyTopics("Bilen startar inte på morgonen")).toEqual([]);
    expect(detectSafetyTopics("Hur ofta ska jag byta bromsvätska?")).toEqual([]);
  });
});
