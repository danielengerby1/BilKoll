import { z } from "zod";
import { AuditVerdict, Urgency } from "@/lib/domain";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export type VehicleContext = {
  make: string;
  model: string;
  year: number;
  fuelType: string;
  variant: string | null;
};

export type MechanicQuestion = {
  question: string;
  history: readonly ChatTurn[];
  vehicle: VehicleContext | null;
  /** Services we can compare prices for, so the model can point to one. */
  services: readonly { slug: string; titleSv: string }[];
};

export const MechanicAnswer = z.object({
  answerSv: z.string().min(1).max(4000),
  urgency: Urgency,
  suggestedServiceSlug: z.string().nullable(),
  followUpQuestionsSv: z.array(z.string()).max(3).default([]),
});
export type MechanicAnswer = z.infer<typeof MechanicAnswer>;

export type QuoteExplanationInput = {
  serviceTitleSv: string;
  vehicle: VehicleContext | null;
  /** Workshop that gave the quote, e.g. "Speedy Bilservice Solna (kedjeverkstad)". */
  workshopSv: string | null;
  rawText: string | null;
  quotedHours: number | null;
  quotedLaborSek: number;
  quotedPartsSek: number;
  /** Everything below is computed by our code – the model must not change the numbers. */
  verdict: AuditVerdict;
  estimateSek: { low: number; typical: number; high: number };
  bookHours: number;
  findingsSv: readonly string[];
};

export const QuoteExplanation = z.object({
  adviceSv: z.string().min(1).max(3000),
  /** The model may only ADD an upsell warning (OR-ed with ours). */
  suspectedUpsell: z.boolean().default(false),
  questionsToAskSv: z.array(z.string()).max(4).default([]),
});
export type QuoteExplanation = z.infer<typeof QuoteExplanation>;

/** Provider-agnostic contract. Features only talk to this. */
export interface AIService {
  readonly provider: string;
  readonly model: string;
  /** Returns null when the provider failed or returned unparsable output. */
  askMechanic(input: MechanicQuestion): Promise<MechanicAnswer | null>;
  explainQuote(input: QuoteExplanationInput): Promise<QuoteExplanation | null>;
}
