"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { List, Map as MapIcon } from "lucide-react";
import type { LatLng } from "@/lib/geo";
import { formatSek } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { RankedOffer } from "../ranking";
import { MapCallout } from "./map-callout";
import { WorkshopListItem, type OfferHighlight } from "./workshop-list-item";
import type { MapPoint } from "./workshop-map.client";

// MapLibre needs the browser – never render it on the server.
const WorkshopMap = dynamic(() => import("./workshop-map.client").then((m) => m.WorkshopMap), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse rounded-2xl bg-muted" aria-label="Laddar karta" />,
});

type Props = {
  offers: readonly RankedOffer[];
  highlights: Record<string, OfferHighlight[]>;
  compareHrefs: Record<string, string>;
  origin: LatLng;
  showOrigin: boolean;
};

/** Apple Maps–style split view: results list + map, kept in sync. */
export function ResultsView({ offers, highlights, compareHrefs, origin, showOrigin }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const points: MapPoint[] = useMemo(
    () =>
      offers.map((o) => ({
        id: o.workshopId,
        name: o.workshopName,
        lat: o.lat,
        lng: o.lng,
        tier: o.tier,
        priceLabel: formatSek(o.estimate.typicalSek),
        isBest: highlights[o.workshopId]?.includes("BAST_VARDE") ?? false,
      })),
    [offers, highlights],
  );

  const selectFromMap = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id) document.querySelector(`[data-workshop-id="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  const selectFromList = (id: string) => {
    setSelectedId(id);
    setMobileView("map");
  };

  const selected = offers.find((o) => o.workshopId === selectedId) ?? null;

  return (
    <div className="grid gap-4">
      {/* Segmented control – mobile only */}
      <div role="tablist" aria-label="Visa som" className="grid grid-cols-2 rounded-xl bg-muted p-1 text-sm font-medium lg:hidden">
        {(["list", "map"] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={mobileView === v}
            onClick={() => setMobileView(v)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg py-2",
              mobileView === v ? "bg-card shadow-sm" : "text-muted-foreground",
            )}
          >
            {v === "list" ? <List aria-hidden className="size-4" /> : <MapIcon aria-hidden className="size-4" />}
            {v === "list" ? "Lista" : "Karta"}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <ol className={cn("grid content-start gap-3", mobileView === "map" && "hidden lg:grid")} aria-label="Verkstäder">
          {offers.map((o) => (
            <li key={o.workshopId}>
              <WorkshopListItem
                offer={o}
                highlights={highlights[o.workshopId] ?? []}
                selected={o.workshopId === selectedId}
                onSelect={() => selectFromList(o.workshopId)}
                compareHref={compareHrefs[o.workshopId] ?? "/granska"}
              />
            </li>
          ))}
        </ol>

        <div className={cn("lg:sticky lg:top-4 lg:self-start", mobileView === "list" && "hidden lg:block")}>
          <div className="relative h-[65vh] lg:h-[calc(100dvh-2rem)]">
            <WorkshopMap
              points={points}
              origin={origin}
              showOrigin={showOrigin}
              selectedId={selectedId}
              onSelect={selectFromMap}
              className="size-full"
            />
            {selected && (
              <MapCallout
                offer={selected}
                compareHref={compareHrefs[selected.workshopId] ?? "/granska"}
                onClose={() => setSelectedId(null)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
