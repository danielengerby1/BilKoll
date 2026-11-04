import { describe, expect, it } from "vitest";
import { extractJson } from "@/server/ai/prompts";
import { createMockAIService } from "@/server/ai/providers/mock";
import { MechanicAnswer, QuoteExplanation } from "@/server/ai/types";

describe("extractJson", () => {
  it("parses JSON wrapped in prose or code fences", () => {
    expect(extractJson('Här:\n```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(extractJson("no json here")).toBeNull();
    expect(extractJson("{broken")).toBeNull();
  });

  it("rejects model output that breaks the schema", () => {
    expect(MechanicAnswer.safeParse({ answerSv: "x", urgency: "KANSKE", suggestedServiceSlug: null }).success).toBe(false);
    expect(QuoteExplanation.safeParse({ adviceSv: "", suspectedUpsell: "kanske" }).success).toBe(false);
  });
});

describe("mock AI provider", () => {
  const ai = createMockAIService();
  const services = [
    { slug: "bromsar-fram", titleSv: "Bromsar fram" },
    { slug: "hjulskifte", titleSv: "Hjulskifte" },
  ];

  it("answers brake questions with high urgency and a service suggestion", async () => {
    const a = await ai.askMechanic({ question: "Det gnisslar när jag bromsar", history: [], vehicle: null, services });
    expect(a?.urgency).toBe("HOG");
    expect(a?.suggestedServiceSlug).toBe("bromsar-fram");
  });

  it("never suggests a service we don't offer", async () => {
    const a = await ai.askMechanic({ question: "Motorlampan lyser", history: [], vehicle: null, services });
    expect(a?.suggestedServiceSlug).toBeNull();
  });

  it("explains a quote without inventing an upsell", async () => {
    const e = await ai.explainQuote({
      serviceTitleSv: "Bromsar fram",
      vehicle: null,
      workshopSv: null,
      rawText: null,
      quotedHours: 1,
      quotedLaborSek: 2000,
      quotedPartsSek: 1500,
      verdict: "BRA_VARDE",
      estimateSek: { low: 3400, typical: 4000, high: 4700 },
      bookHours: 1.3,
      findingsSv: [],
    });
    expect(e?.suspectedUpsell).toBe(false);
    expect(e?.adviceSv).toMatch(/prisvärt/);
  });
});
