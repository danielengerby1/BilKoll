import { describe, expect, it } from "vitest";
import { auditQuote, findUpsellKeywords } from "@/features/quote-audit/audit";
import { detectSafetyTopics } from "@/features/ai-mechanic/safety";
import { estimatePrice } from "@/lib/estimate";

const chainBrakes = estimatePrice({ estimatedHours: 1.3, typicalPartsSek: 1900 }, "KEDJA"); // 3630–4600

describe("auditQuote", () => {
  it("rates a quote inside the estimate as Bra värde", () => {
    const r = auditQuote({ quotedHours: 1.3, quotedLaborSek: 2100, quotedPartsSek: 1900, rawText: null }, chainBrakes);
    expect(r.verdict).toBe("BRA_VARDE");
    expect(r.suspectedUpsell).toBe(false);
    expect(r.findings).toEqual([]);
  });

  it("rates a cheap quote as Billigt and asks to check what's included", () => {
    const r = auditQuote({ quotedHours: 1, quotedLaborSek: 1500, quotedPartsSek: 1200, rawText: null }, chainBrakes);
    expect(r.verdict).toBe("BILLIGT");
    expect(r.findings.map((f) => f.code)).toContain("BELOW_ESTIMATE");
  });

  it("rates an expensive quote as Dyrt with reasons", () => {
    const r = auditQuote({ quotedHours: 1.5, quotedLaborSek: 3500, quotedPartsSek: 3500, rawText: null }, chainBrakes);
    expect(r.verdict).toBe("DYRT");
    const codes = r.findings.map((f) => f.code);
    expect(codes).toContain("PARTS_ABOVE_ESTIMATE");
    expect(codes).toContain("HOURLY_RATE_ABOVE_BAND");
  });

  it("flags padded hours as suspected upsell", () => {
    const r = auditQuote({ quotedHours: 3, quotedLaborSek: 3000, quotedPartsSek: 1900, rawText: null }, chainBrakes);
    expect(r.suspectedUpsell).toBe(true);
  });

  it("flags upsell keywords even when the total is fine", () => {
    const r = auditQuote(
      { quotedHours: 1.3, quotedLaborSek: 2100, quotedPartsSek: 1900, rawText: "Bromsar fram. Rekommenderas: motorrengöring" },
      chainBrakes,
    );
    expect(r.verdict).toBe("BRA_VARDE");
    expect(r.suspectedUpsell).toBe(true);
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
