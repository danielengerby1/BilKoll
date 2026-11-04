"use client";

import { startTransition, useActionState } from "react";
import { CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBookingAction } from "../server/actions";

type Props = { workshopId: string; serviceSlug: string; defaultRegnr?: string; minDate: string };

export function BookingForm({ workshopId, serviceSlug, defaultRegnr, minDate }: Props) {
  const [state, action, pending] = useActionState(createBookingAction, null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="grid gap-4"
    >
      <input type="hidden" name="workshopId" value={workshopId} />
      <input type="hidden" name="serviceSlug" value={serviceSlug} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="customerName">Namn</Label>
          <Input id="customerName" name="customerName" autoComplete="name" required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="customerEmail">E-post</Label>
          <Input id="customerEmail" name="customerEmail" type="email" autoComplete="email" required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="customerPhone">Telefon (valfritt)</Label>
          <Input id="customerPhone" name="customerPhone" type="tel" autoComplete="tel" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="regnr">Regnr</Label>
          <Input id="regnr" name="regnr" defaultValue={defaultRegnr} placeholder="ABC 123" className="uppercase" maxLength={8} />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="preferredDate">Önskat datum</Label>
          <Input id="preferredDate" name="preferredDate" type="date" min={minDate} defaultValue={minDate} required />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="messageSv">Meddelande till verkstaden (valfritt)</Label>
        <Textarea id="messageSv" name="messageSv" rows={3} placeholder="T.ex. symptom, önskad tid på dagen eller om du behöver lånebil." />
      </div>
      {state && !state.ok && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending}>
        <CalendarCheck aria-hidden /> {pending ? "Skickar…" : "Skicka bokningsförfrågan"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Verkstaden bekräftar tiden. Priset gäller för en normal bil – verkstaden ska kontakta dig innan något extra arbete utförs.
      </p>
    </form>
  );
}
