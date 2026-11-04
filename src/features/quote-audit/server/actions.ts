"use server";

import { z } from "zod";
import { firstZodError, type ActionResult } from "@/lib/action-result";
import { AuditVerdict } from "@/lib/domain";
import { parseSekInput } from "@/lib/money";
import { isValidRegnr, normalizeRegnr } from "@/lib/regnr";
import { getAIService } from "@/server/ai";
import { db } from "@/server/db";
import { auditQuote, type AuditResult, mergeVerdicts } from "../audit";

const sekField = (label: string) =>
  z
    .string()
    .transform((v, ctx) => {
      const n = parseSekInput(v);
      if (n === null) {
        ctx.addIssue({ code: "custom", message: `Ange ${label} i kronor.` });
        return z.NEVER;
      }
      return n;
    })
    .pipe(z.number().int().max(500_000, { error: `${label} verkar orimligt högt.` }));

const AuditInput = z.object({
  serviceSlug: z.string().min(1, { error: "Välj vilket jobb offerten gäller." }),
  regnr: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .refine((v) => v === null || isValidRegnr(v), { error: "Ogiltigt registreringsnummer." })
    .transform((v) => (v ? normalizeRegnr(v) : null)),
  quotedHours: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v.replace(",", "."))))
    .refine((v) => v === null || (Number.isFinite(v) && v > 0 && v < 100), { error: "Ange antal timmar, t.ex. 1,5." }),
  quotedLaborSek: sekField("arbetskostnaden"),
  quotedPartsSek: sekField("materialkostnaden"),
  rawText: z
    .string()
    .trim()
    .max(5000, { error: "Offerttexten är för lång (max 5 000 tecken)." })
    .transform((v) => (v === "" ? null : v)),
});

export type AuditResponse = AuditResult & {
  id: string;
  serviceTitleSv: string;
  adviceSv: string;
  questionsToAskSv: string[];
  aiModel: string;
};

export async function auditQuoteAction(
  _prev: ActionResult<AuditResponse> | null,
  formData: FormData,
): Promise<ActionResult<AuditResponse>> {
  const str = (k: string) => String(formData.get(k) ?? "");
  const parsed = AuditInput.safeParse({
    serviceSlug: str("serviceSlug"),
    regnr: str("regnr"),
    quotedHours: str("quotedHours"),
    quotedLaborSek: str("quotedLaborSek"),
    quotedPartsSek: str("quotedPartsSek"),
    rawText: str("rawText"),
  });
  if (!parsed.success) return { ok: false, error: firstZodError(parsed.error) };
  const input = parsed.data;

  const service = await db.standardService.findUnique({
    where: { slug: input.serviceSlug },
    include: { prices: { select: { fixedPriceSek: true, partsPriceSek: true } } },
  });
  const vehicle = input.regnr ? await db.vehicle.findUnique({ where: { regnr: input.regnr } }) : null;

  // 1. Numbers: deterministic, from our own data.
  const result = auditQuote(
    input,
    service && service.prices.length > 0
      ? {
          estimatedHours: service.estimatedHours,
          marketTotalsSek: service.prices.map((p) => p.fixedPriceSek + p.partsPriceSek),
          marketPartsSek: service.prices.map((p) => p.partsPriceSek),
        }
      : null,
  );

  // 2. Words: the AI explains. It may only make the verdict stricter.
  const ai = getAIService();
  const serviceTitleSv = service?.titleSv ?? input.serviceSlug;
  const explanation = await ai.explainQuote({
    serviceTitleSv,
    vehicle: vehicle
      ? { make: vehicle.make, model: vehicle.model, year: vehicle.year, fuelType: vehicle.fuelType, variant: vehicle.variant }
      : null,
    rawText: input.rawText,
    quotedHours: input.quotedHours,
    quotedLaborSek: input.quotedLaborSek,
    quotedPartsSek: input.quotedPartsSek,
    deterministicVerdict: result.verdict,
    benchmarkHours: result.benchmarkHours,
    benchmarkTotalSek: result.benchmarkTotalSek,
    fairRangeSek: result.fairRangeSek,
    findingsSv: result.findings.map((f) => f.textSv),
  });

  const verdict = AuditVerdict.parse(
    mergeVerdicts(result.verdict, input.rawText ? (explanation?.verdict ?? null) : null),
  );
  const adviceSv =
    explanation?.adviceSv ??
    (result.findings.map((f) => f.textSv).join(" ") || "Offerten ligger i linje med marknadspriset.");
  const aiModel = explanation ? ai.model : "deterministic";

  const saved = await db.quoteAudit.create({
    data: {
      regnr: vehicle?.regnr ?? null,
      serviceType: input.serviceSlug,
      rawText: input.rawText,
      quotedHours: input.quotedHours,
      quotedLaborSek: input.quotedLaborSek,
      quotedPartsSek: input.quotedPartsSek,
      benchmarkHours: result.benchmarkHours,
      benchmarkTotalSek: result.benchmarkTotalSek,
      verdict,
      adviceSv,
      aiModel,
    },
  });

  return {
    ok: true,
    data: {
      ...result,
      verdict,
      id: saved.id,
      serviceTitleSv,
      adviceSv,
      questionsToAskSv: explanation?.questionsToAskSv ?? [],
      aiModel,
    },
  };
}
