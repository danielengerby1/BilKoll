import Link from "next/link";
import { Navigation, Phone, ScanSearch, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatSek } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { RankedOffer } from "../ranking";
import { workshopTypeLabel } from "./workshop-list-item";

type Props = { offer: RankedOffer; compareHref: string; onClose: () => void };

/** Frosted-glass card over the map for the selected workshop (Apple Maps "place card"). */
export function MapCallout({ offer, compareHref, onClose }: Props) {
  const directions = `https://maps.apple.com/?daddr=${offer.lat},${offer.lng}&q=${encodeURIComponent(offer.workshopName)}`;
  return (
    <div
      role="dialog"
      aria-label={offer.workshopName}
      className="absolute inset-x-3 bottom-3 grid gap-3 rounded-2xl border border-white/60 bg-white/85 p-4 shadow-xl backdrop-blur-xl sm:left-auto sm:w-96"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold leading-snug">{offer.workshopName}</h3>
          <p className="text-sm text-muted-foreground">{workshopTypeLabel(offer)}</p>
          <p className="truncate text-sm text-muted-foreground">
            {offer.address}, {offer.city} · ca {offer.distanceKm.toLocaleString("sv-SE")} km
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Stäng"
          className="grid size-8 shrink-0 place-items-center rounded-full bg-black/5 hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X aria-hidden className="size-4" />
        </button>
      </div>
      <div className="rounded-xl bg-black/[0.04] px-3 py-2">
        <p className="text-xs text-muted-foreground">BilKolls uppskattning inkl. moms</p>
        <p className="font-bold tabular-nums">
          {formatSek(offer.estimate.lowSek)}–{formatSek(offer.estimate.highSek)}{" "}
          <span className="font-normal text-muted-foreground">· typiskt {formatSek(offer.estimate.typicalSek)}</span>
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Link href={compareHref} className={cn(buttonVariants({ size: "sm" }), "col-span-3 h-10 sm:col-span-1")}>
          <ScanSearch aria-hidden /> Jämför
        </Link>
        {offer.phone ? (
          <a href={`tel:${offer.phone.replace(/[^\d+]/g, "")}`} className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "h-10")}>
            <Phone aria-hidden /> Ring
          </a>
        ) : (
          <span />
        )}
        <a href={directions} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ size: "sm", variant: "secondary" }), "h-10")}>
          <Navigation aria-hidden /> Vägbeskrivning
        </a>
      </div>
    </div>
  );
}
