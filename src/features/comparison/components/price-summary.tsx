import { Info } from "lucide-react";
import { formatSek } from "@/lib/money";

type Props = {
  minSek: number | null;
  medianSek: number | null;
  maxSek: number | null;
  fairRange: { low: number; high: number } | null;
  count: number;
};

export function PriceSummary({ minSek, medianSek, maxSek, fairRange, count }: Props) {
  if (minSek === null || maxSek === null) return null;
  return (
    <section aria-label="Prisöversikt" className="rounded-xl border bg-card p-5 shadow-sm">
      <dl className="grid grid-cols-3 gap-4 text-center">
        <div>
          <dt className="text-xs text-muted-foreground">Lägst</dt>
          <dd className="text-xl font-bold text-success">{formatSek(minSek)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Medianpris</dt>
          <dd className="text-xl font-bold">{medianSek !== null ? formatSek(medianSek) : "–"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Högst</dt>
          <dd className="text-xl font-bold text-destructive">{formatSek(maxSek)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        Skillnad mellan dyrast och billigast: <strong className="text-foreground">{formatSek(maxSek - minSek)}</strong> ·{" "}
        {count} verkstäder · alla priser inkl. moms
      </p>
      {fairRange && (
        <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-sm">
          <Info aria-hidden className="size-4 text-primary" />
          Rimligt pris enligt normaltid och Stockholms timpriser: {formatSek(fairRange.low)}–{formatSek(fairRange.high)} inkl. moms
        </p>
      )}
    </section>
  );
}
