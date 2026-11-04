"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type Map as MlMap, type Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Maximize2, Minus, Plus } from "lucide-react";
import type { WorkshopTier } from "@/lib/domain";
import type { LatLng } from "@/lib/geo";
import { cn } from "@/lib/utils";

export type MapPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  tier: WorkshopTier;
  priceLabel: string;
  isBest: boolean;
};

type Props = {
  points: readonly MapPoint[];
  origin: LatLng;
  showOrigin: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  className?: string;
};

/** Free vector tiles, no API key: https://openfreemap.org */
const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

/** Apple Maps–inspired palette applied on top of the Positron style. */
function applyApplePalette(m: MlMap) {
  for (const layer of m.getStyle().layers) {
    const id = layer.id.toLowerCase();
    const set = (prop: string, value: unknown) => {
      try {
        m.setPaintProperty(layer.id, prop, value);
      } catch {
        /* property not supported by this layer – ignore */
      }
    };
    if (layer.type === "background") set("background-color", "#f4f2ed");
    else if (layer.type === "fill" && id.includes("water")) set("fill-color", "#a7d2f4");
    else if (layer.type === "line" && id.includes("waterway")) set("line-color", "#a7d2f4");
    else if (layer.type === "fill" && /park|wood|grass|landcover|cemetery/.test(id)) {
      set("fill-color", "#d3eac3");
      set("fill-opacity", 0.85);
    } else if (layer.type === "fill" && id.includes("building")) set("fill-color", "#e7e4dc");
    else if (layer.type === "line" && id.includes("casing")) set("line-color", "#dcd8cf");
    else if (layer.type === "line" && /highway|road|street|tunnel|bridge/.test(id)) {
      set("line-color", /motorway|trunk|major|primary/.test(id) ? "#fde9a6" : "#ffffff");
    }
  }
}

const TIER_COLOR: Record<WorkshopTier, string> = {
  KEDJA: "#0a84ff",
  FRISTAENDE: "#30b0c7",
  MARKESVERKSTAD: "#5e5ce6",
};

const WRENCH =
  '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>';
const STAR =
  '<svg viewBox="0 0 24 24" width="15" height="15" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function pinElement(p: MapPoint): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "bk-pin";
  el.setAttribute("role", "button");
  el.setAttribute("tabindex", "0");
  el.setAttribute("aria-label", `${p.name}, uppskattat ${p.priceLabel}`);
  el.innerHTML = `
    <div class="bk-pin__dot" style="background:${TIER_COLOR[p.tier]}">${p.tier === "MARKESVERKSTAD" ? STAR : WRENCH}</div>
    <div class="bk-pin__label">${escapeHtml(p.priceLabel)}</div>`;
  if (p.isBest) el.classList.add("bk-pin--best");
  return el;
}

export function WorkshopMap({ points, origin, showOrigin, selectedId, onSelect, className }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const markers = useRef(new Map<string, { marker: Marker; el: HTMLDivElement }>());
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Create the map once.
  useEffect(() => {
    if (!container.current) return;
    let cancelled = false;
    const markerStore = markers.current;
    const m = new maplibregl.Map({
      container: container.current,
      style: STYLE_URL,
      center: [origin.lng, origin.lat],
      zoom: 10,
      attributionControl: { compact: true },
      cooperativeGestures: false,
    });
    map.current = m;
    m.once("style.load", () => {
      if (!cancelled) applyApplePalette(m);
    });
    m.on("click", (e) => {
      if (!(e.originalEvent.target as HTMLElement).closest(".bk-pin")) onSelectRef.current(null);
    });
    return () => {
      cancelled = true;
      m.remove();
      map.current = null;
      markerStore.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- map is created once; points/origin sync below
  }, []);

  // Sync markers with points and fit the view.
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    for (const { marker } of markers.current.values()) marker.remove();
    markers.current.clear();

    for (const p of points) {
      const el = pinElement(p);
      const select = (ev: Event) => {
        ev.stopPropagation();
        onSelectRef.current(p.id);
      };
      el.addEventListener("click", select);
      el.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter" || ev.key === " ") select(ev);
      });
      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" }).setLngLat([p.lng, p.lat]).addTo(m);
      markers.current.set(p.id, { marker, el });
    }

    let originMarker: Marker | null = null;
    if (showOrigin) {
      const dot = document.createElement("div");
      dot.className = "bk-origin";
      dot.setAttribute("aria-label", "Din plats (postnummer)");
      originMarker = new maplibregl.Marker({ element: dot }).setLngLat([origin.lng, origin.lat]).addTo(m);
    }

    fitAll(m, points, showOrigin ? origin : null);
    return () => {
      originMarker?.remove();
    };
  }, [points, origin, showOrigin]);

  // Highlight + fly to the selected workshop.
  useEffect(() => {
    const m = map.current;
    for (const [id, { el }] of markers.current) el.classList.toggle("bk-pin--selected", id === selectedId);
    if (!m || !selectedId) return;
    const p = points.find((x) => x.id === selectedId);
    if (p) m.easeTo({ center: [p.lng, p.lat], zoom: Math.max(m.getZoom(), 12.5), duration: 600, offset: [0, -60] });
  }, [selectedId, points]);

  const zoom = (delta: number) => map.current?.easeTo({ zoom: (map.current.getZoom() ?? 10) + delta, duration: 250 });

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border shadow-sm", className)}>
      <div ref={container} className="absolute inset-0" />
      <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-xl border border-white/60 bg-white/75 shadow-md backdrop-blur-md">
        <button type="button" onClick={() => zoom(1)} aria-label="Zooma in" className="grid size-10 place-items-center hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Plus aria-hidden className="size-4" />
        </button>
        <div className="h-px bg-black/10" />
        <button type="button" onClick={() => zoom(-1)} aria-label="Zooma ut" className="grid size-10 place-items-center hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Minus aria-hidden className="size-4" />
        </button>
        <div className="h-px bg-black/10" />
        <button
          type="button"
          onClick={() => map.current && fitAll(map.current, points, showOrigin ? origin : null)}
          aria-label="Visa alla verkstäder"
          className="grid size-10 place-items-center hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Maximize2 aria-hidden className="size-4" />
        </button>
      </div>
      <MapLegend />
    </div>
  );
}

function fitAll(m: MlMap, points: readonly MapPoint[], origin: LatLng | null) {
  const coords = points.map((p) => [p.lng, p.lat] as [number, number]);
  if (origin) coords.push([origin.lng, origin.lat]);
  if (coords.length === 0) return;
  const bounds = coords.reduce((b, c) => b.extend(c), new maplibregl.LngLatBounds(coords[0], coords[0]));
  m.fitBounds(bounds, { padding: { top: 60, bottom: 60, left: 50, right: 70 }, maxZoom: 13, duration: 500 });
}

function MapLegend() {
  const items: { tier: WorkshopTier; label: string }[] = [
    { tier: "KEDJA", label: "Kedja" },
    { tier: "FRISTAENDE", label: "Fristående" },
    { tier: "MARKESVERKSTAD", label: "Märkesverkstad" },
  ];
  return (
    <ul className="absolute left-3 top-3 flex gap-3 rounded-full border border-white/60 bg-white/75 px-3 py-1.5 text-xs shadow-md backdrop-blur-md">
      {items.map((i) => (
        <li key={i.tier} className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-full" style={{ background: TIER_COLOR[i.tier] }} />
          {i.label}
        </li>
      ))}
    </ul>
  );
}
