import Link from "next/link";
import { SORT_MODE_LABEL_SV, SortMode } from "@/lib/domain";
import { cn } from "@/lib/utils";

type Props = { current: SortMode; params: Record<string, string | undefined> };

export function SortTabs({ current, params }: Props) {
  return (
    <nav aria-label="Sortera" className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
      {SortMode.options.map((mode) => {
        const qs = new URLSearchParams();
        for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
        qs.set("sortera", mode);
        const active = mode === current;
        return (
          <Link
            key={mode}
            href={`/jamfor?${qs.toString()}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {SORT_MODE_LABEL_SV[mode]}
          </Link>
        );
      })}
    </nav>
  );
}
