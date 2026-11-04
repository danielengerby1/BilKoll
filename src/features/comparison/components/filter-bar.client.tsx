"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { WORKSHOP_FILTER_LABEL_SV, WorkshopFilter } from "@/lib/domain";
import { cn } from "@/lib/utils";

type Props = {
  filter: WorkshopFilter;
  make: string | null;
  /** True when the make comes from the looked-up car (regnr). */
  makeFromCar: boolean;
  makes: readonly string[];
  dealerCount: number;
};

/** Segmented workshop-type filter + brand picker. Updates the URL (shareable). */
export function FilterBar({ filter, make, makeFromCar, makes, dealerCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    startTransition(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  return (
    <div className={cn("flex flex-wrap items-end gap-3 transition-opacity", pending && "opacity-60")}>
      <div role="radiogroup" aria-label="Verkstadstyp" className="flex rounded-xl bg-muted p-1 text-sm font-medium">
        {WorkshopFilter.options.map((f) => (
          <button
            key={f}
            type="button"
            role="radio"
            aria-checked={filter === f}
            onClick={() => update({ typ: f === "ALLA" ? null : f })}
            className={cn(
              "rounded-lg px-3 py-1.5 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              filter === f ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {WORKSHOP_FILTER_LABEL_SV[f]}
          </button>
        ))}
      </div>

      <div className="grid gap-1">
        <Label htmlFor="marke" className="text-xs text-muted-foreground">
          Bilmärke {makeFromCar && "(från regnr)"}
        </Label>
        <NativeSelect
          id="marke"
          value={make ?? ""}
          onChange={(e) => update({ marke: e.target.value || null })}
          className="h-9 min-w-44"
        >
          <option value="">Alla märken</option>
          {makes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </NativeSelect>
      </div>

      <p className="pb-2 text-xs text-muted-foreground">
        {make
          ? dealerCount > 0
            ? `${dealerCount} märkesverkstäder för ${make} i Stockholms län`
            : `Inga märkesverkstäder för ${make} i vår lista ännu`
          : "Välj bilmärke för att se märkesverkstäder"}
      </p>
    </div>
  );
}
