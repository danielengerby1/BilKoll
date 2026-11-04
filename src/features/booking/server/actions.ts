"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { firstZodError, type ActionResult } from "@/lib/action-result";
import { BookingStatus } from "@/lib/domain";
import { isValidRegnr, normalizeRegnr } from "@/lib/regnr";
import { db } from "@/server/db";

const BookingInput = z.object({
  workshopId: z.string().min(1),
  serviceSlug: z.string().min(1),
  customerName: z.string().trim().min(2, { error: "Skriv ditt namn." }).max(100),
  customerEmail: z.email({ error: "Skriv en giltig e-postadress." }),
  customerPhone: z
    .string()
    .trim()
    .max(20)
    .refine((v) => v === "" || /^[\d\s+()-]{7,20}$/.test(v), { error: "Ogiltigt telefonnummer." })
    .transform((v) => (v === "" ? null : v)),
  regnr: z
    .string()
    .trim()
    .refine((v) => v === "" || isValidRegnr(v), { error: "Ogiltigt registreringsnummer." })
    .transform((v) => (v === "" ? null : normalizeRegnr(v))),
  preferredDate: z.iso.date({ error: "Välj ett datum." }).refine((d) => new Date(`${d}T23:59:59`) >= new Date(), {
    error: "Välj ett datum från idag och framåt.",
  }),
  messageSv: z
    .string()
    .trim()
    .max(1000)
    .transform((v) => (v === "" ? null : v)),
});

export async function createBookingAction(_prev: ActionResult<null> | null, formData: FormData): Promise<ActionResult<null>> {
  const str = (k: string) => String(formData.get(k) ?? "");
  const parsed = BookingInput.safeParse({
    workshopId: str("workshopId"),
    serviceSlug: str("serviceSlug"),
    customerName: str("customerName"),
    customerEmail: str("customerEmail").trim(),
    customerPhone: str("customerPhone"),
    regnr: str("regnr"),
    preferredDate: str("preferredDate"),
    messageSv: str("messageSv"),
  });
  if (!parsed.success) return { ok: false, error: firstZodError(parsed.error) };
  const input = parsed.data;

  // Price snapshot comes from the DB, never from the form.
  const price = await db.workshopServicePrice.findFirst({
    where: { workshopId: input.workshopId, service: { slug: input.serviceSlug } },
  });
  if (!price) return { ok: false, error: "Verkstaden erbjuder inte den här tjänsten längre." };

  // Only link a vehicle we have looked up (FK); otherwise keep the request without it.
  const vehicle = input.regnr ? await db.vehicle.findUnique({ where: { regnr: input.regnr } }) : null;

  const booking = await db.bookingRequest.create({
    data: {
      workshopId: input.workshopId,
      serviceId: price.serviceId,
      regnr: vehicle?.regnr ?? null,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      preferredDate: new Date(`${input.preferredDate}T09:00:00`),
      messageSv: [input.regnr && !vehicle ? `Regnr: ${input.regnr}` : null, input.messageSv].filter(Boolean).join("\n") || null,
      quotedTotalSek: price.fixedPriceSek + price.partsPriceSek,
      status: BookingStatus.parse("SKICKAD"),
    },
  });

  redirect(`/boka/tack/${booking.id}`);
}
