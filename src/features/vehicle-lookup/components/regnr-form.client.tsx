"use client";

import { startTransition, useActionState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { lookupVehicleAction } from "../server/actions";

export function RegnrForm() {
  const [state, action, pending] = useActionState(lookupVehicleAction, null);
  const error = state && !state.ok ? state.error : null;

  return (
    <form
        onSubmit={(e) => {
          // Keep the user's input on validation errors (form actions reset the form).
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          startTransition(() => action(data));
        }}
        className="flex flex-col gap-2">
      <Label htmlFor="regnr-lookup">Registreringsnummer</Label>
      <div className="flex gap-2">
        <div className="flex h-12 flex-1 items-stretch overflow-hidden rounded-md border-2 border-foreground/80 bg-card shadow-xs focus-within:ring-[3px] focus-within:ring-ring/50">
          <span aria-hidden className="flex w-8 flex-col items-center justify-end bg-[oklch(0.45_0.15_260)] pb-1 text-[10px] font-bold text-white">
            S
          </span>
          <input
            id="regnr-lookup"
            name="regnr"
            placeholder="ABC 123"
            autoComplete="off"
            maxLength={8}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "regnr-error" : undefined}
            className="w-full bg-transparent px-3 text-xl font-semibold uppercase tracking-widest outline-none placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-foreground"
          />
        </div>
        <Button type="submit" size="lg" disabled={pending}>
          <Search aria-hidden />
          {pending ? "Söker…" : "Hämta bil"}
        </Button>
      </div>
      {error && (
        <p id="regnr-error" role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </form>
  );
}
