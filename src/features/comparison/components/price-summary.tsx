import { Info } from "lucide-react";
import { TIER_ESTIMATE, WORKSHOP_TIER_LABEL_SV, WorkshopTier } from "@/lib/domain";
import type { PriceEstimate } from "@/lib/estimate";
import { formatSek } from "@/lib/money";

type Props = { market: PriceEstimate; count: number; tierEstimates: Record<WorkshopTier, PriceEstimate> };

export function PriceSummary({ market, count, tierEstimates }: Props) {
  return (
    <section aria-label="Standardpris" className="grid gap-4 rounded-xl border bg-card p-5 shadow-sm">
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">BilKolls standardpris i Stockholm</p>
        <p className="text-3xl font-bold tabular-nums">ca {formatSek(market.typicalSek)}</p>
        <p className="text-sm text-muted-foreground">
          Spann {formatSek(market.lowSek)}–{formatSek(market.highSek)} inkl. moms · normaltid ca {market.hours.toLocaleString("sv-SE")} h · {count} verkstäder
        </p>
      </div>
      <dl className="grid gap-2 text-center text-sm sm:grid-cols-3">
        {WorkshopTier.options.map((tier) => {
          const e = tierEstimates[tier];
          const rate = TIER_ESTIMATE[tier].rateSek;
          return (
            <div key={tier} className="rounded-lg bg-muted px-3 py-2">
              <dt className="text-muted-foreground">{WORKSHOP_TIER_LABEL_SV[tier]}</dt>
              <dd className="font-semibold tabular-nums">
                {formatSek(e.lowSek)}–{formatSek(e.highSek)}
              </dd>
              <dd className="text-xs text-muted-foreground">
                timpris ca {formatSek(rate.min)}–{formatSek(rate.max)}
              </dd>
            </div>
          );
        })}
      </dl>
      <p className="flex items-start justify-center gap-1.5 text-center text-sm">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
        Uppskattningar, inte verkstädernas egna priser. Be om en offert och jämför den med vårt pris.
      </p>
    </section>
  );
}
