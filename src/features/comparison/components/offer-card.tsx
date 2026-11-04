import Link from "next/link";
import { ExternalLink, MapPin, Phone, ScanSearch, ThumbsUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
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

type Props = {
  offer: RankedOffer;
  highlights: readonly OfferHighlight[];
  compareHref: string;
};

export function OfferCard({ offer, highlights, compareHref }: Props) {
  const { estimate } = offer;
  const isBest = highlights.includes("BAST_VARDE");
  const typeLabel =
    offer.chain === "INDEPENDENT"
      ? WORKSHOP_TIER_LABEL_SV[offer.tier]
      : `${WORKSHOP_TIER_LABEL_SV[offer.tier]} · ${WORKSHOP_CHAIN_LABEL_SV[offer.chain]}`;

  return (
    <article
      className={cn(
        "grid gap-4 rounded-xl border bg-card p-5 shadow-sm md:grid-cols-[1fr_auto]",
        isBest && "border-primary ring-1 ring-primary",
      )}
    >
      <div className="grid content-start gap-2">
        {highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {highlights.map((h) => {
              const { label, icon: Icon } = HIGHLIGHT[h];
              return (
                <Badge key={h} variant={h === "BAST_VARDE" ? "default" : "accent"}>
                  <Icon aria-hidden /> {label}
                </Badge>
              );
            })}
          </div>
        )}
        <h3 className="text-lg font-semibold">
          <Link href={`/verkstad/${offer.workshopId}`} className="hover:underline">
            {offer.workshopName}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground">{typeLabel}</p>
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin aria-hidden className="size-4" /> {offer.address}, {offer.city} · ca {offer.distanceKm.toLocaleString("sv-SE")} km
          </span>
          {offer.phone && (
            <a href={`tel:${offer.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-1 hover:text-foreground hover:underline">
              <Phone aria-hidden className="size-4" /> {offer.phone}
            </a>
          )}
          {offer.website && (
            <a href={offer.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground hover:underline">
              <ExternalLink aria-hidden className="size-4" /> Webbplats
            </a>
          )}
        </p>
        <TrustBadges
          isGodkandBilverkstad={offer.isGodkandBilverkstad}
          isMrf={offer.isMrf}
          isAuthorized={offer.isAuthorizedForMake}
        />
        <dl className="grid w-fit grid-cols-[auto_auto] gap-x-6 gap-y-0.5 text-sm">
          <dt className="text-muted-foreground">Arbetskostnad</dt>
          <dd className="text-right tabular-nums">
            {formatSek(estimate.laborSek.low)}–{formatSek(estimate.laborSek.high)}
          </dd>
          <dt className="text-muted-foreground">Materialkostnad</dt>
          <dd className="text-right tabular-nums">
            {estimate.partsSek.high === 0 ? "–" : `${formatSek(estimate.partsSek.low)}–${formatSek(estimate.partsSek.high)}`}
          </dd>
        </dl>
      </div>

      <div className="flex flex-col items-start gap-1 md:items-end md:text-right">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Uppskattat pris</p>
        <p className="text-2xl font-bold tabular-nums">
          {formatSek(estimate.lowSek)}–{formatSek(estimate.highSek)}
        </p>
        <p className="text-sm text-muted-foreground">
          typiskt ca <strong className="text-foreground">{formatSek(estimate.typicalSek)}</strong> inkl. moms
        </p>
        <p className="text-xs text-muted-foreground">Värdepoäng {offer.valueScore}/100</p>
        <Link href={compareHref} className={cn(buttonVariants({ size: "lg" }), "mt-3 w-full md:w-auto")}>
          <ScanSearch aria-hidden /> Jämför din offert
        </Link>
      </div>
    </article>
  );
}
