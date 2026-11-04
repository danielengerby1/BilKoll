"use client";

import { startTransition, useActionState, useState } from "react";
import { ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { auditQuoteAction } from "../server/actions";
import { AuditResult } from "./audit-result";

type Props = {
  services: readonly { slug: string; titleSv: string }[];
  workshops: readonly { id: string; name: string; city: string }[];
  defaultRegnr?: string;
  defaultService?: string;
  defaultWorkshopId?: string;
};

export function QuoteForm({ services, workshops, defaultRegnr, defaultService, defaultWorkshopId }: Props) {
  const [state, action, pending] = useActionState(auditQuoteAction, null);
  const [serviceSlug, setServiceSlug] = useState(defaultService ?? services[0]?.slug ?? "");

  return (
    <div className="grid gap-6">
      <form
        onSubmit={(e) => {
          // Keep the user's input on validation errors (form actions reset the form).
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          startTransition(() => action(data));
        }}
        className="grid gap-4 rounded-xl border bg-card p-5 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="serviceSlug">Vad gäller offerten?</Label>
            <NativeSelect id="serviceSlug" name="serviceSlug" value={serviceSlug} onChange={(e) => setServiceSlug(e.target.value)}>
              {services.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.titleSv}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="workshopId">Vilken verkstad gav offerten?</Label>
            <NativeSelect id="workshopId" name="workshopId" defaultValue={defaultWorkshopId ?? ""}>
              <option value="">Annan / vet inte – jämför med Stockholms standardpris</option>
              {workshops.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.city})
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="regnr">Regnr (valfritt)</Label>
            <Input id="regnr" name="regnr" placeholder="ABC 123" defaultValue={defaultRegnr} className="uppercase" maxLength={8} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="quotedLaborSek">Arbetskostnad (kr inkl. moms)</Label>
            <Input id="quotedLaborSek" name="quotedLaborSek" inputMode="numeric" placeholder="t.ex. 2 400" required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="quotedPartsSek">Materialkostnad (kr inkl. moms)</Label>
            <Input id="quotedPartsSek" name="quotedPartsSek" inputMode="numeric" placeholder="t.ex. 1 900" required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="quotedHours">Antal arbetstimmar (om det står)</Label>
            <Input id="quotedHours" name="quotedHours" inputMode="decimal" placeholder="t.ex. 1,5" />
          </div>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="rawText">Klistra in offerttexten (valfritt)</Label>
          <Textarea
            id="rawText"
            name="rawText"
            rows={5}
            placeholder="Klistra in raderna från offerten eller SMS:et – då kan vi hitta tillägg du inte bett om."
          />
        </div>
        {state && !state.ok && (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        )}
        <Button type="submit" size="lg" disabled={pending}>
          <ScanSearch aria-hidden /> {pending ? "Jämför…" : "Jämför med BilKolls pris"}
        </Button>
      </form>

      {state?.ok && <AuditResult result={state.data} serviceSlug={serviceSlug} />}
    </div>
  );
}
