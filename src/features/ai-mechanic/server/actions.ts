"use server";

import { z } from "zod";
import { firstZodError, type ActionResult } from "@/lib/action-result";
import { Urgency } from "@/lib/domain";
import { isValidRegnr, normalizeRegnr } from "@/lib/regnr";
import { getAIService } from "@/server/ai";
import { db } from "@/server/db";
import { detectSafetyTopics, SAFETY_MESSAGE_SV } from "../safety";

const AskInput = z.object({
  question: z
    .string()
    .trim()
    .min(3, { error: "Skriv en fråga om din bil." })
    .max(1000, { error: "Frågan är för lång (max 1 000 tecken)." }),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) }))
    .max(20)
    .default([]),
  regnr: z.string().nullable().default(null),
});

export type MechanicReply = {
  answerSv: string;
  urgency: Urgency;
  safetyWarningsSv: string[];
  suggestedService: { slug: string; titleSv: string } | null;
  followUpQuestionsSv: string[];
};

const FALLBACK_ANSWER =
  "Jag kunde inte svara just nu. Om bilen beter sig konstigt eller en varningslampa lyser – kontakta en verkstad för felsökning.";

export async function askMechanicAction(input: unknown): Promise<ActionResult<MechanicReply>> {
  const parsed = AskInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstZodError(parsed.error) };
  const { question, history, regnr } = parsed.data;

  const [services, vehicle] = await Promise.all([
    db.standardService.findMany({ select: { slug: true, titleSv: true }, orderBy: { sortOrder: "asc" } }),
    regnr && isValidRegnr(regnr) ? db.vehicle.findUnique({ where: { regnr: normalizeRegnr(regnr) } }) : null,
  ]);

  // Deterministic safety net first – never depends on the model.
  const topics = detectSafetyTopics(question);
  const safetyWarningsSv = topics.map((t) => SAFETY_MESSAGE_SV[t]);

  const answer = await getAIService().askMechanic({
    question,
    history,
    services,
    vehicle: vehicle
      ? { make: vehicle.make, model: vehicle.model, year: vehicle.year, fuelType: vehicle.fuelType, variant: vehicle.variant }
      : null,
  });

  const suggested = services.find((s) => s.slug === answer?.suggestedServiceSlug) ?? null;
  const urgency: Urgency = topics.length > 0 ? "HOG" : (answer?.urgency ?? "MEDEL");

  return {
    ok: true,
    data: {
      answerSv: answer?.answerSv ?? FALLBACK_ANSWER,
      urgency,
      safetyWarningsSv,
      suggestedService: suggested,
      followUpQuestionsSv: answer?.followUpQuestionsSv ?? [],
    },
  };
}
