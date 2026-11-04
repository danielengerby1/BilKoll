import { formatSek } from "@/lib/money";
import { cn } from "@/lib/utils";

type Props = { lowSek: number; typicalSek: number; highSek: number; quotedSek: number };

/**
 * Shows where the quote lands: [ billigt | bra värde | dyrt ].
 * Inline styles are used only for data-driven positions (Tailwind can't express them).
 */
export function RangeMeter({ lowSek, typicalSek, highSek, quotedSek }: Props) {
  const min = Math.min(lowSek * 0.6, quotedSek * 0.95);
  const max = Math.max(highSek * 1.4, quotedSek * 1.05);
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const quotedPct = pct(quotedSek);
  // Keep the label inside the card near the edges.
  const labelAlign = quotedPct > 80 ? "-translate-x-full" : quotedPct < 20 ? "translate-x-0" : "-translate-x-1/2";

  return (
    <figure
      className="grid gap-1"
      aria-label={`Din offert ${formatSek(quotedSek)} jämfört med uppskattat spann ${formatSek(lowSek)} till ${formatSek(highSek)}`}
    >
      <div className="relative h-6">
        <span
          className={cn("absolute top-0 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-xs font-semibold text-background", labelAlign)}
          style={{ left: `${quotedPct}%` }}
        >
          Din offert {formatSek(quotedSek)}
        </span>
      </div>
      <div className="relative h-3 rounded-full bg-destructive/25">
        <div className="absolute inset-y-0 left-0 rounded-l-full bg-secondary" style={{ width: `${pct(lowSek)}%` }} />
        <div
          className="absolute inset-y-0 bg-success/50"
          style={{ left: `${pct(lowSek)}%`, width: `${pct(highSek) - pct(lowSek)}%` }}
        />
        <div aria-hidden className="absolute -inset-y-1 w-1 -translate-x-1/2 rounded bg-foreground" style={{ left: `${quotedPct}%` }} />
      </div>
      <div className="relative h-5 text-xs text-muted-foreground">
        <span className="absolute -translate-x-1/2" style={{ left: `${pct(lowSek)}%` }}>
          {formatSek(lowSek)}
        </span>
        <span className="absolute -translate-x-1/2" style={{ left: `${pct(highSek)}%` }}>
          {formatSek(highSek)}
        </span>
      </div>
      <figcaption className="flex justify-between text-xs text-muted-foreground">
        <span>Billigt</span>
        <span>Bra värde · typiskt {formatSek(typicalSek)}</span>
        <span>Dyrt</span>
      </figcaption>
    </figure>
  );
}
