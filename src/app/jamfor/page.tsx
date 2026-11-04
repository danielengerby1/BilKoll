import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FilterBar } from "@/features/comparison/components/filter-bar.client";
import { PriceSummary } from "@/features/comparison/components/price-summary";
import { ResultsView } from "@/features/comparison/components/results-view.client";
import { SearchForm } from "@/features/comparison/components/search-form";
import { SortTabs } from "@/features/comparison/components/sort-tabs";
import { ValueExplainer } from "@/features/comparison/components/value-explainer";
import type { OfferHighlight } from "@/features/comparison/components/workshop-list-item";
import { sortOffers } from "@/features/comparison/ranking";
import { getComparison, getServiceBySlug, listServices } from "@/features/comparison/server/queries";
import { getOrFetchVehicle } from "@/features/vehicle-lookup/server/queries";
import { priceClassFor, servicesNotApplicable } from "@/lib/car-models";
import { FuelType, SortMode, WorkshopFilter, WorkshopTier } from "@/lib/domain";
import { estimatePrice } from "@/lib/estimate";
import { formatPostalCode, isValidPostalCode, normalizePostalCode } from "@/lib/geo";
import { formatRegnr } from "@/lib/regnr";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Hitta verkstad" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

export default async function ComparePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const tjanst = one(sp.tjanst) ?? "bas-service";
  const postnrRaw = one(sp.postnr);
  const postnr = postnrRaw && isValidPostalCode(postnrRaw) ? normalizePostalCode(postnrRaw) : undefined;
  const regnrRaw = one(sp.regnr);
  const sort = SortMode.catch("BAST_VARDE").parse(one(sp.sortera));
  const filter = WorkshopFilter.catch("ALLA").parse(one(sp.typ));
  const markeParam = one(sp.marke);

  const [services, service, vehicle] = await Promise.all([
    listServices(),
    getServiceBySlug(tjanst),
    regnrRaw ? getOrFetchVehicle(regnrRaw) : null,
  ]);

  const make = markeParam ?? vehicle?.make ?? null;
  const priceClass = vehicle ? priceClassFor(vehicle.make, vehicle.model) : make ? priceClassFor(make, "") : "STANDARD";
  const comparison = service
    ? await getComparison({ serviceSlug: service.slug, postalCode: postnr ?? null, make, filter, priceClass })
    : null;

  const fuel = vehicle ? FuelType.safeParse(vehicle.fuelType) : null;
  const notApplicable = fuel?.success && service ? servicesNotApplicable(fuel.data).includes(service.slug) : false;
  const sorted = comparison ? sortOffers(comparison.offers, sort) : [];
  const tierEstimates = service
    ? (Object.fromEntries(WorkshopTier.options.map((t) => [t, estimatePrice(service, t, priceClass)])) as Record<
        WorkshopTier,
        ReturnType<typeof estimatePrice>
      >)
    : null;

  const highlights: Record<string, OfferHighlight[]> = {};
  const compareHrefs: Record<string, string> = {};
  for (const o of sorted) {
    const h: OfferHighlight[] = [];
    if (comparison?.bestValueId === o.workshopId) h.push("BAST_VARDE");
    if (comparison?.cheapestId === o.workshopId) h.push("BILLIGAST");
    if (postnr && comparison?.nearestId === o.workshopId) h.push("NARMAST");
    highlights[o.workshopId] = h;
    const qs = new URLSearchParams({ verkstad: o.workshopId, tjanst });
    if (vehicle) qs.set("regnr", vehicle.regnr);
    compareHrefs[o.workshopId] = `/granska?${qs}`;
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{service ? service.titleSv : "Hitta verkstad"}</h1>
        {service?.descriptionSv && <p className="text-muted-foreground">{service.descriptionSv}</p>}
        <p className="text-sm text-muted-foreground">
          {vehicle
            ? `För ${vehicle.make} ${vehicle.model} (${formatRegnr(vehicle.regnr)})${priceClass === "PREMIUM" ? " – räknat som premiumbil" : ""} · `
            : ""}
          {postnr
            ? comparison?.postalCodeResolved
              ? `Avstånd från ${formatPostalCode(postnr)}`
              : "Okänt postnummer – avstånd räknas från Stockholm C"
            : "Avstånd från Stockholm C – ange postnummer för att se närmaste"}
        </p>
      </div>

      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <SearchForm services={services} defaults={{ tjanst, postnr: postnrRaw, regnr: regnrRaw }} compact />
      </div>

      {regnrRaw && !vehicle && (
        <Alert variant="warning">
          <AlertTriangle aria-hidden />
          <AlertTitle>Vi hittade inte bilen</AlertTitle>
          <AlertDescription>Kontrollera registreringsnumret. Uppskattningarna nedan gäller en genomsnittlig bil.</AlertDescription>
        </Alert>
      )}

      {notApplicable && (
        <Alert variant="warning">
          <AlertTriangle aria-hidden />
          <AlertTitle>Behövs inte för din bil</AlertTitle>
          <AlertDescription>
            {vehicle?.make} {vehicle?.model} är en elbil och har ingen motorolja eller kamrem. Tacka nej om en verkstad föreslår det.
          </AlertDescription>
        </Alert>
      )}

      {!service && <p>Vi hittade inte den tjänsten. Välj en tjänst i listan ovan.</p>}

      {comparison && tierEstimates && (
        <>
          <PriceSummary market={comparison.market} count={comparison.offers.length} tierEstimates={tierEstimates} />
          <div className="flex flex-wrap items-end justify-between gap-3">
            <FilterBar
              filter={filter}
              make={make}
              makeFromCar={!markeParam && Boolean(vehicle)}
              makes={comparison.makes}
              dealerCount={comparison.dealerCountForMake}
            />
            <SortTabs current={sort} params={{ tjanst, postnr: postnrRaw, regnr: regnrRaw, typ: one(sp.typ), marke: markeParam }} />
          </div>
          {sorted.length > 0 ? (
            <ResultsView
              offers={sorted}
              highlights={highlights}
              compareHrefs={compareHrefs}
              origin={comparison.origin}
              showOrigin={Boolean(postnr && comparison.postalCodeResolved)}
            />
          ) : (
            <p className="rounded-2xl border bg-card p-6 text-center text-muted-foreground">
              Inga verkstäder matchar filtret. Prova ”Alla” eller ett annat bilmärke.
            </p>
          )}
          <ValueExplainer />
        </>
      )}
    </div>
  );
}
