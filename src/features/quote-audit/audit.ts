import { AUDIT_VERDICT_SEVERITY, STOCKHOLM_HOURLY_RATE_SEK, type AuditVerdict } from "@/lib/domain";
import { formatSek, laborCostSek, median, sumSek } from "@/lib/money";

const hoursSv = (h: number) => `${h.toLocaleString("sv-SE")} h`;

/**
 * Deterministic quote benchmark. All numbers come from here – never from the AI.
 * The AI may only explain, and may only make a verdict stricter (see mergeVerdicts).
 */

export type QuoteInput = {
  quotedHours: number | null;
  quotedLaborSek: number;
  quotedPartsSek: number;
  rawText: string | null;
};

export type ServiceBenchmarkInput = {
  /** Book time ("normaltid") for the service. */
  estimatedHours: number;
  /** Totals (labour + parts) from workshops in our DB for this service. */
  marketTotalsSek: readonly number[];
  marketPartsSek: readonly number[];
};

export type AuditFinding = { code: AuditFindingCode; textSv: string };
export type AuditFindingCode =
  | "HOURS_ABOVE_BOOK_TIME"
  | "HOURLY_RATE_ABOVE_BAND"
  | "TOTAL_ABOVE_MARKET"
  | "PARTS_ABOVE_MARKET"
  | "UPSELL_KEYWORDS"
  | "NO_BENCHMARK";

export type AuditResult = {
  verdict: AuditVerdict;
  quotedTotalSek: number;
  benchmarkHours: number | null;
  benchmarkTotalSek: number | null;
  /** Fair range for this job: low = cheap workshop, high = expensive but still reasonable. */
  fairRangeSek: { low: number; high: number } | null;
  effectiveHourlyRateSek: number | null;
  /** Positive = how much more than the benchmark. */
  overBenchmarkSek: number | null;
  findings: AuditFinding[];
};

/** total / benchmark ratios. */
export const VERDICT_THRESHOLDS = { reasonable: 1.15, slightlyHigh: 1.4 } as const;
/** Quoted hours above book time × this factor suggests padding or extra work. */
export const HOURS_PADDING_FACTOR = 1.6;

/**
 * Words that often signal add-ons sold on top of the job you asked for.
 * Not wrong in themselves – but worth asking about.
 */
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

export function auditQuote(quote: QuoteInput, bench: ServiceBenchmarkInput | null): AuditResult {
  const quotedTotalSek = sumSek(quote.quotedLaborSek, quote.quotedPartsSek);
  const findings: AuditFinding[] = [];
  const effectiveHourlyRateSek =
    quote.quotedHours && quote.quotedHours > 0 ? Math.round(quote.quotedLaborSek / quote.quotedHours) : null;

  if (effectiveHourlyRateSek !== null && effectiveHourlyRateSek > STOCKHOLM_HOURLY_RATE_SEK.max) {
    findings.push({
      code: "HOURLY_RATE_ABOVE_BAND",
      textSv: `Timpriset blir ${formatSek(effectiveHourlyRateSek)}/h. Vanligt i Stockholm är ${formatSek(STOCKHOLM_HOURLY_RATE_SEK.min)}–${formatSek(STOCKHOLM_HOURLY_RATE_SEK.max)}/h inkl. moms.`,
    });
  }

  const upsell = findUpsellKeywords(quote.rawText);
  if (upsell.length > 0) {
    findings.push({
      code: "UPSELL_KEYWORDS",
      textSv: `Offerten nämner tillägg som ofta säljs extra: ${upsell.join(", ")}. Fråga om de verkligen behövs.`,
    });
  }

  if (!bench) {
    findings.push({ code: "NO_BENCHMARK", textSv: "Vi har inget jämförelsepris för just det här jobbet ännu." });
    return {
      verdict: upsell.length > 0
        ? "MISSTANKT_MERFORSALJNING"
        : findings.some((f) => f.code === "HOURLY_RATE_ABOVE_BAND")
          ? "NAGOT_HOGT"
          : "RIMLIGT",
      quotedTotalSek,
      benchmarkHours: null,
      benchmarkTotalSek: null,
      fairRangeSek: null,
      effectiveHourlyRateSek,
      overBenchmarkSek: null,
      findings,
    };
  }

  const fairRangeSek = computeFairRange(bench);
  const benchmarkTotalSek = median(bench.marketTotalsSek) ?? fairRangeSek.typical;
  const ratio = benchmarkTotalSek > 0 ? quotedTotalSek / benchmarkTotalSek : 1;

  if (quote.quotedHours !== null && quote.quotedHours > bench.estimatedHours * HOURS_PADDING_FACTOR) {
    findings.push({
      code: "HOURS_ABOVE_BOOK_TIME",
      textSv: `Offerten räknar med ${hoursSv(quote.quotedHours)}. Normaltiden för jobbet är ungefär ${hoursSv(bench.estimatedHours)}.`,
    });
  }

  const partsMedian = median(bench.marketPartsSek);
  if (partsMedian !== null && quote.quotedPartsSek > partsMedian * VERDICT_THRESHOLDS.slightlyHigh) {
    findings.push({
      code: "PARTS_ABOVE_MARKET",
      textSv: `Materialkostnaden är högre än vanligt (typiskt runt ${formatSek(partsMedian)}). Be om en specifikation av delarna.`,
    });
  }

  if (ratio > VERDICT_THRESHOLDS.reasonable) {
    findings.push({
      code: "TOTAL_ABOVE_MARKET",
      textSv: `Totalpriset är ${Math.round((ratio - 1) * 100)} % över medianpriset hos verkstäder i Stockholm.`,
    });
  }

  let verdict: AuditVerdict =
    ratio <= VERDICT_THRESHOLDS.reasonable ? "RIMLIGT" : ratio <= VERDICT_THRESHOLDS.slightlyHigh ? "NAGOT_HOGT" : "FOR_HOGT";
  if (findings.some((f) => f.code === "HOURS_ABOVE_BOOK_TIME" || f.code === "UPSELL_KEYWORDS") && ratio > 1) {
    verdict = "MISSTANKT_MERFORSALJNING";
  }

  return {
    verdict,
    quotedTotalSek,
    benchmarkHours: bench.estimatedHours,
    benchmarkTotalSek,
    fairRangeSek: { low: fairRangeSek.low, high: fairRangeSek.high },
    effectiveHourlyRateSek,
    overBenchmarkSek: quotedTotalSek - benchmarkTotalSek,
    findings,
  };
}

/** Book hours × the Stockholm rate band, plus the typical parts cost. */
export function computeFairRange(bench: ServiceBenchmarkInput): { low: number; high: number; typical: number } {
  const parts = median(bench.marketPartsSek) ?? 0;
  return {
    low: laborCostSek(bench.estimatedHours, STOCKHOLM_HOURLY_RATE_SEK.min) + parts,
    high: laborCostSek(bench.estimatedHours, STOCKHOLM_HOURLY_RATE_SEK.max) + parts,
    typical: laborCostSek(bench.estimatedHours, STOCKHOLM_HOURLY_RATE_SEK.typical) + parts,
  };
}

/** The AI may escalate a verdict, never soften it. */
export function mergeVerdicts(deterministic: AuditVerdict, fromAi: AuditVerdict | null): AuditVerdict {
  if (!fromAi) return deterministic;
  return AUDIT_VERDICT_SEVERITY[fromAi] > AUDIT_VERDICT_SEVERITY[deterministic] ? fromAi : deterministic;
}
