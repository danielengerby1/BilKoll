"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { firstZodError, type ActionResult } from "@/lib/action-result";
import { isValidRegnr, normalizeRegnr } from "@/lib/regnr";
import { getOrFetchVehicle } from "./queries";

const LookupInput = z.object({
  regnr: z
    .string()
    .trim()
    .min(1, { error: "Skriv in ett registreringsnummer." })
    .refine(isValidRegnr, { error: "Det ser inte ut som ett svenskt registreringsnummer (t.ex. ABC 123)." }),
});

export async function lookupVehicleAction(_prev: ActionResult<null> | null, formData: FormData): Promise<ActionResult<null>> {
  const parsed = LookupInput.safeParse({ regnr: formData.get("regnr") ?? "" });
  if (!parsed.success) return { ok: false, error: firstZodError(parsed.error) };

  const vehicle = await getOrFetchVehicle(parsed.data.regnr);
  if (!vehicle) return { ok: false, error: "Vi hittade ingen bil med det registreringsnumret." };

  redirect(`/bil/${normalizeRegnr(vehicle.regnr)}`);
}
