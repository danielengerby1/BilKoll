import Link from "next/link";
import { AlertTriangle, Clock, MapPin, Star, ThumbsUp, TrendingDown, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatSlotSv } from "@/lib/dates";
import { formatSek } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { RankedOffer } from "../ranking";
import { TrustBadges } from "./trust-badges";

export type OfferHighlight = "BAST_VARDE" | "BILLIGAST" | "TIDIGAST" | "NARMAST";

const HIGHLIGHT: Record<OfferHighlight, { label: string; icon: typeof ThumbsUp }> = {
  BAST_VARDE: { label: "Bäst värde", icon: ThumbsUp },
  BILLIGAST: { label: "Billigast", icon: TrendingDown },
  TIDIGAST: { label: "Tidigast tid", icon: Zap },
  NARMAST: { label: "Närmast", icon: MapPin },
};

type Props = {
  offer: RankedOffer;
  highlights: readonly OfferHighlight[];
  bookHref: string;
};

export function OfferCard({ offer, highlights, bookHref }: Props) {
  const isBest = highlights.includes("BAST_VARDE");
  return (
    <article
      className={cn(
        "grid gap-4 rounded-xl border bg-card p-5 shadow-sm md:grid-cols-[1fr_auto]",
        isBest && "border-primary ring-1 ring-primary",
      )}
    >
      <div className="grid gap-2">
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
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin aria-hidden className="size-4" /> {offer.city} · {offer.distanceKm.toLocaleString("sv-SE")} km
          </span>
          <span className="flex items-center gap-1">
            <Star aria-hidden className="size-4 fill-warning text-warning" /> {offer.rating.toLocaleString("sv-SE")} ({offer.reviewCount} omdömen)
          </span>
          {offer.nextAvailableAt && (
            <span className="flex items-center gap-1">
              <Clock aria-hidden className="size-4" /> Tidigast {formatSlotSv(offer.nextAvailableAt)}
            </span>
          )}
        </p>
        <TrustBadges
          isGodkandBilverkstad={offer.isGodkandBilverkstad}
          isMrf={offer.isMrf}
          isAuthorized={offer.isAuthorizedForMake}
        />
        <dl className="grid w-fit grid-cols-[auto_auto] gap-x-6 gap-y-0.5 text-sm">
          <dt className="text-muted-foreground">Arbetskostnad</dt>
          <dd className="text-right tabular-nums">{formatSek(offer.laborSek)}</dd>
          <dt className="text-muted-foreground">Materialkostnad</dt>
          <dd className="text-right tabular-nums">{formatSek(offer.partsSek)}</dd>
          <dt className="text-muted-foreground">Timpris</dt>
          <dd className="text-right tabular-nums">{formatSek(offer.hourlyRateSek)}/h</dd>
        </dl>
        {offer.noteSv && <p className="text-xs text-muted-foreground">{offer.noteSv}</p>}
      </div>

      <div className="flex flex-col items-start gap-2 md:items-end md:text-right">
        <p className="text-3xl font-bold tabular-nums">{formatSek(offer.totalSek)}</p>
        <p className="text-xs text-muted-foreground">totalt inkl. moms</p>
        {offer.savingVsMedianSek > 0 && (
          <p className="text-sm font-medium text-success">{formatSek(offer.savingVsMedianSek)} under medianpriset</p>
        )}
        {offer.isPriceOutlier && (
          <p className="flex items-center gap-1 text-sm font-medium text-destructive">
            <AlertTriangle aria-hidden className="size-4" /> Klart dyrare än övriga
          </p>
        )}
        <p className="text-xs text-muted-foreground">Värdepoäng {offer.valueScore}/100</p>
        <Link href={bookHref} className={cn(buttonVariants({ size: "lg" }), "mt-auto w-full md:w-auto")}>
          Boka tid
        </Link>
      </div>
    </article>
  );
}
