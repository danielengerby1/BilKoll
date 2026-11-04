import { STOCKHOLM_HOURLY_RATE_SEK, type AuditVerdict } from "@/lib/domain";
import { classifyOffer, type PriceEstimate } from "@/lib/estimate";
import { formatSek, sumSek } from "@/lib/money";

/**
 * Compares a quote the user received with BilKoll's estimate.
 * All numbers come from here – never from the AI. The AI may only explain,
 * and may only ADD an upsell warning, never remove one.
 */

const hoursSv = (h: number) => `${h.toLocaleString("sv-SE")} h`;

export type QuoteInput = {
  quotedHours: number | null;
  quotedLaborSek: number;
  quotedPartsSek: number;
  rawText: string | null;
};

export type AuditFindingCode =
  | "BELOW_ESTIMATE"
  | "HOURS_ABOVE_BOOK_TIME"
  | "HOURLY_RATE_ABOVE_BAND"
  | "PARTS_ABOVE_ESTIMATE"
  | "UPSELL_KEYWORDS";
export type AuditFinding = { code: AuditFindingCode; textSv: string };

export type AuditResult = {
  verdict: AuditVerdict;
  quotedTotalSek: number;
  estimate: PriceEstimate;
  diffFromTypicalPct: number;
  positionInRange: number;
  effectiveHourlyRateSek: number | null;
  suspectedUpsell: boolean;
  findings: AuditFinding[];
};

/** Quoted hours above book time × this factor suggests padding or extra work. */
export const HOURS_PADDING_FACTOR = 1.6;

/** Words that often signal add-ons sold on top of the job you asked for. */
export const UPSELL_KEYWORDS = [
  "motorrengöring",
  "motorspolning",
  "spolning",
  "additiv",
  "tillsats",
  "rekommenderas",
  "rekommenderar",
  "förebyggande",
  "rengöring av insprut",
  "bränslesystemrengöring",
  "ac-rengöring",
  "luftkonditioneringsrengöring",
  "skyddsbehandling",
  "rostskydd",
  "lackskydd",
  "kupérengöring",
  "växellådsspolning",
] as const;

export function findUpsellKeywords(rawText: string | null): string[] {
  if (!rawText) return [];
  const text = rawText.toLowerCase();
  return UPSELL_KEYWORDS.filter((k) => text.includes(k));
}

export function auditQuote(quote: QuoteInput, estimate: PriceEstimate): AuditResult {
  const quotedTotalSek = sumSek(quote.quotedLaborSek, quote.quotedPartsSek);
  const signal = classifyOffer(quotedTotalSek, estimate);
  const findings: AuditFinding[] = [];

  const effectiveHourlyRateSek =
    quote.quotedHours && quote.quotedHours > 0 ? Math.round(quote.quotedLaborSek / quote.quotedHours) : null;

  if (signal.verdict === "BILLIGT") {
    findings.push({
      code: "BELOW_ESTIMATE",
      textSv: "Priset är lägre än vi räknat med. Kontrollera att alla delar, moms och eventuella avgifter ingår.",
    });
  }

  if (quote.quotedHours !== null && quote.quotedHours > estimate.hours * HOURS_PADDING_FACTOR) {
    findings.push({
      code: "HOURS_ABOVE_BOOK_TIME",
      textSv: `Offerten räknar med ${hoursSv(quote.quotedHours)}. Normaltiden för jobbet är ungefär ${hoursSv(estimate.hours)}.`,
    });
  }

  if (effectiveHourlyRateSek !== null && effectiveHourlyRateSek > STOCKHOLM_HOURLY_RATE_SEK.max) {
    findings.push({
      code: "HOURLY_RATE_ABOVE_BAND",
      textSv: `Timpriset blir ${formatSek(effectiveHourlyRateSek)}/h. Vanligt i Stockholm är ${formatSek(STOCKHOLM_HOURLY_RATE_SEK.min)}–${formatSek(STOCKHOLM_HOURLY_RATE_SEK.max)}/h inkl. moms.`,
    });
  }

  if (quote.quotedPartsSek > estimate.partsSek.high * 1.2) {
    findings.push({
      code: "PARTS_ABOVE_ESTIMATE",
      textSv: `Materialkostnaden är högre än vi räknat med (upp till ca ${formatSek(estimate.partsSek.high)}). Be om en specifikation av delarna.`,
    });
  }

  const upsell = findUpsellKeywords(quote.rawText);
  if (upsell.length > 0) {
    findings.push({
      code: "UPSELL_KEYWORDS",
      textSv: `Offerten nämner tillägg som ofta säljs extra: ${upsell.join(", ")}. Fråga om de verkligen behövs.`,
    });
  }

  const suspectedUpsell = upsell.length > 0 || findings.some((f) => f.code === "HOURS_ABOVE_BOOK_TIME");

  return {
    verdict: signal.verdict,
    quotedTotalSek,
    estimate,
    diffFromTypicalPct: signal.diffFromTypicalPct,
    positionInRange: signal.positionInRange,
    effectiveHourlyRateSek,
    suspectedUpsell,
    findings,
  };
}
