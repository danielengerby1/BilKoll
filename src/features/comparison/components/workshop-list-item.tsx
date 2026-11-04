import Link from "next/link";
import { MapPin, ThumbsUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WORKSHOP_CHAIN_LABEL_SV, WORKSHOP_TIER_LABEL_SV } from "@/lib/domain";
import { formatSek } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { RankedOffer } from "../ranking";
import { TrustBadges } from "./trust-badges";

export type OfferHighlight = "BAST_VARDE" | "BILLIGAST" | "NARMAST";

const HIGHLIGHT: Record<OfferHighlight, { label: string; icon: typeof ThumbsUp }> = {
  BAST_VARDE: { label: "Bäst värde", icon: ThumbsUp },
  BILLIGAST: { label: "Lägst uppskattat pris", icon: TrendingDown },
  NARMAST: { label: "Närmast", icon: MapPin },
};

export function workshopTypeLabel(offer: Pick<RankedOffer, "tier" | "chain" | "authorizedMakes">): string {
  if (offer.tier === "MARKESVERKSTAD" && offer.authorizedMakes) return `Märkesverkstad · ${offer.authorizedMakes.replace(/,/g, ", ")}`;
  if (offer.chain === "INDEPENDENT") return WORKSHOP_TIER_LABEL_SV[offer.tier];
  return `${WORKSHOP_TIER_LABEL_SV[offer.tier]} · ${WORKSHOP_CHAIN_LABEL_SV[offer.chain]}`;
}

type Props = {
  offer: RankedOffer;
  highlights: readonly OfferHighlight[];
  selected: boolean;
  onSelect: () => void;
  compareHref: string;
};

/** Compact Apple Maps–style result row. Clicking selects the pin on the map. */
export function WorkshopListItem({ offer, highlights, selected, onSelect, compareHref }: Props) {
  const { estimate } = offer;
  return (
    <article
      data-workshop-id={offer.workshopId}
      className={cn(
        "grid gap-2 rounded-2xl border bg-card p-4 shadow-xs transition-colors",
        selected ? "border-primary ring-2 ring-primary/30" : "hover:border-primary/40",
      )}
    >
      <button type="button" onClick={onSelect} className="grid gap-1.5 text-left focus-visible:outline-none" aria-pressed={selected}>
        {highlights.length > 0 && (
          <span className="flex flex-wrap gap-1.5">
            {highlights.map((h) => {
              const { label, icon: Icon } = HIGHLIGHT[h];
              return (
                <Badge key={h} variant={h === "BAST_VARDE" ? "default" : "accent"}>
                  <Icon aria-hidden /> {label}
                </Badge>
              );
            })}
          </span>
        )}
        <span className="flex items-start justify-between gap-3">
          <span className="min-w-0">
            <span className="block font-semibold leading-snug">{offer.workshopName}</span>
            <span className="block text-sm text-muted-foreground">{workshopTypeLabel(offer)}</span>
          </span>
          <span className="shrink-0 text-right">
            <span className="block text-xs text-muted-foreground">Uppskattat</span>
            <span className="block font-bold tabular-nums">ca {formatSek(estimate.typicalSek)}</span>
          </span>
        </span>
        <span className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span className="flex min-w-0 items-center gap-1">
            <MapPin aria-hidden className="size-3.5 shrink-0" />
            <span className="truncate">
              {offer.address}, {offer.city}
            </span>
          </span>
          <span className="shrink-0 tabular-nums">ca {offer.distanceKm.toLocaleString("sv-SE")} km</span>
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          Spann {formatSek(estimate.lowSek)}–{formatSek(estimate.highSek)} inkl. moms · värdepoäng {offer.valueScore}/100
        </span>
      </button>
      <TrustBadges isGodkandBilverkstad={offer.isGodkandBilverkstad} isMrf={offer.isMrf} isAuthorized={offer.isAuthorizedForMake} />
      <div className="flex flex-wrap gap-2 text-sm">
        <Link href={compareHref} className="font-medium text-primary hover:underline">
          Jämför din offert
        </Link>
        <span aria-hidden className="text-muted-foreground">·</span>
        <Link href={`/verkstad/${offer.workshopId}`} className="text-muted-foreground hover:text-foreground hover:underline">
          Verkstadsinfo
        </Link>
      </div>
    </article>
  );
}
