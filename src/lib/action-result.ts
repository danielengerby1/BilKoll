import type { z } from "zod";

/** Every Server Action returns this shape. */
export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Ogiltiga uppgifter.";
}
