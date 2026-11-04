"use server";

import { z } from "zod";
import { firstZodError, type ActionResult } from "@/lib/action-result";
import { priceClassFor } from "@/lib/car-models";
import { AuditVerdict, WORKSHOP_TIER_LABEL_SV, WorkshopTier } from "@/lib/domain";
import { estimatePrice, marketEstimate } from "@/lib/estimate";
import { parseSekInput } from "@/lib/money";
import { isValidRegnr, normalizeRegnr } from "@/lib/regnr";
import { getAIService } from "@/server/ai";
import { db } from "@/server/db";
import { auditQuote, type AuditResult } from "../audit";

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

const optional = (v: string) => (v.trim() === "" ? null : v.trim());

const AuditInput = z.object({
  serviceSlug: z.string().min(1, { error: "Välj vilket jobb offerten gäller." }),
  workshopId: z.string().transform(optional),
  regnr: z
    .string()
    .transform(optional)
    .refine((v) => v === null || isValidRegnr(v), { error: "Ogiltigt registreringsnummer." })
    .transform((v) => (v ? normalizeRegnr(v) : null)),
  quotedHours: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v.replace(",", "."))))
    .refine((v) => v === null || (Number.isFinite(v) && v > 0 && v < 100), { error: "Ange antal timmar, t.ex. 1,5." }),
  quotedLaborSek: sekField("arbetskostnaden"),
  quotedPartsSek: sekField("materialkostnaden"),
  rawText: z.string().max(5000, { error: "Offerttexten är för lång (max 5 000 tecken)." }).transform(optional),
});

export type AuditResponse = AuditResult & {
  id: string;
  serviceTitleSv: string;
  /** "Speedy Bilservice Solna" or null when compared with the Stockholm standard. */
  workshopName: string | null;
  comparedWithSv: string;
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
    workshopId: str("workshopId"),
    regnr: str("regnr"),
    quotedHours: str("quotedHours"),
    quotedLaborSek: str("quotedLaborSek"),
    quotedPartsSek: str("quotedPartsSek"),
    rawText: str("rawText"),
  });
  if (!parsed.success) return { ok: false, error: firstZodError(parsed.error) };
  const input = parsed.data;

  const [service, workshop, vehicle] = await Promise.all([
    db.standardService.findUnique({ where: { slug: input.serviceSlug } }),
    input.workshopId ? db.workshop.findUnique({ where: { id: input.workshopId } }) : null,
    input.regnr ? db.vehicle.findUnique({ where: { regnr: input.regnr } }) : null,
  ]);
  if (!service) return { ok: false, error: "Vi känner inte igen jobbet. Välj ett i listan." };

  // 1. Numbers: our estimate for THIS workshop type (or the Stockholm standard).
  const priceClass = vehicle ? priceClassFor(vehicle.make, vehicle.model) : "STANDARD";
  const tier = workshop ? WorkshopTier.catch("KEDJA").parse(workshop.tier) : null;
  const estimate = tier ? estimatePrice(service, tier, priceClass) : marketEstimate(service, priceClass);
  const result = auditQuote(input, estimate);
  const comparedWithSv = tier
    ? `vår uppskattning för ${WORKSHOP_TIER_LABEL_SV[tier].toLowerCase()}`
    : "BilKolls standardpris i Stockholm";

  // 2. Words: the AI explains. It may only add an upsell warning.
  const ai = getAIService();
  const explanation = await ai.explainQuote({
    serviceTitleSv: service.titleSv,
    vehicle: vehicle
      ? { make: vehicle.make, model: vehicle.model, year: vehicle.year, fuelType: vehicle.fuelType, variant: vehicle.variant }
      : null,
    workshopSv: workshop && tier ? `${workshop.name} (${WORKSHOP_TIER_LABEL_SV[tier].toLowerCase()})` : null,
    rawText: input.rawText,
    quotedHours: input.quotedHours,
    quotedLaborSek: input.quotedLaborSek,
    quotedPartsSek: input.quotedPartsSek,
    verdict: result.verdict,
    estimateSek: { low: estimate.lowSek, typical: estimate.typicalSek, high: estimate.highSek },
    bookHours: estimate.hours,
    findingsSv: result.findings.map((f) => f.textSv),
  });

  const suspectedUpsell = result.suspectedUpsell || (input.rawText !== null && explanation?.suspectedUpsell === true);
  const adviceSv = explanation?.adviceSv ?? result.findings.map((f) => f.textSv).join(" ");
  const aiModel = explanation ? ai.model : "deterministic";

  // Stored with workshopId: real quotes become calibration data for our estimates.
  const saved = await db.quoteAudit.create({
    data: {
      regnr: vehicle?.regnr ?? null,
      workshopId: workshop?.id ?? null,
      serviceType: service.slug,
      rawText: input.rawText,
      quotedHours: input.quotedHours,
      quotedLaborSek: input.quotedLaborSek,
      quotedPartsSek: input.quotedPartsSek,
      benchmarkHours: estimate.hours,
      benchmarkLowSek: estimate.lowSek,
      benchmarkTotalSek: estimate.typicalSek,
      benchmarkHighSek: estimate.highSek,
      verdict: AuditVerdict.parse(result.verdict),
      suspectedUpsell,
      adviceSv,
      aiModel,
    },
  });

  return {
    ok: true,
    data: {
      ...result,
      suspectedUpsell,
      id: saved.id,
      serviceTitleSv: service.titleSv,
      workshopName: workshop?.name ?? null,
      comparedWithSv,
      adviceSv,
      questionsToAskSv: explanation?.questionsToAskSv ?? [],
      aiModel,
    },
  };
}
