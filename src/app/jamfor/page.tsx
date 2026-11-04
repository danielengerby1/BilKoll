import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { OfferCard, type OfferHighlight } from "@/features/comparison/components/offer-card";
import { PriceSummary } from "@/features/comparison/components/price-summary";
import { SearchForm } from "@/features/comparison/components/search-form";
import { SortTabs } from "@/features/comparison/components/sort-tabs";
import { ValueExplainer } from "@/features/comparison/components/value-explainer";
import { sortOffers } from "@/features/comparison/ranking";
import { getComparison, getServiceBySlug, listServices } from "@/features/comparison/server/queries";
import { getOrFetchVehicle } from "@/features/vehicle-lookup/server/queries";
import { priceClassFor, servicesNotApplicable } from "@/lib/car-models";
import { FuelType, SortMode, WorkshopTier } from "@/lib/domain";
import { estimatePrice } from "@/lib/estimate";
import { formatPostalCode, isValidPostalCode, normalizePostalCode } from "@/lib/geo";
import { formatRegnr } from "@/lib/regnr";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Jämför verkstäder" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

export default async function ComparePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const tjanst = one(sp.tjanst) ?? "bas-service";
  const postnrRaw = one(sp.postnr);
  const postnr = postnrRaw && isValidPostalCode(postnrRaw) ? normalizePostalCode(postnrRaw) : undefined;
  const regnrRaw = one(sp.regnr);
  const sort = SortMode.catch("BAST_VARDE").parse(one(sp.sortera));

  const [services, service, vehicle] = await Promise.all([
    listServices(),
    getServiceBySlug(tjanst),
    regnrRaw ? getOrFetchVehicle(regnrRaw) : null,
  ]);

  const priceClass = vehicle ? priceClassFor(vehicle.make, vehicle.model) : "STANDARD";
  const comparison = service
    ? await getComparison({ serviceSlug: service.slug, postalCode: postnr ?? null, make: vehicle?.make ?? null, priceClass })
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

  const highlightsFor = (id: string): OfferHighlight[] => {
    if (!comparison) return [];
    const h: OfferHighlight[] = [];
    if (comparison.bestValueId === id) h.push("BAST_VARDE");
    if (comparison.cheapestId === id) h.push("BILLIGAST");
    if (postnr && comparison.nearestId === id) h.push("NARMAST");
    return h;
  };

  const compareHref = (workshopId: string) => {
    const qs = new URLSearchParams({ verkstad: workshopId, tjanst });
    if (vehicle) qs.set("regnr", vehicle.regnr);
    return `/granska?${qs}`;
  };

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{service ? service.titleSv : "Jämför verkstäder"}</h1>
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

      <div className="rounded-xl border bg-card p-4 shadow-sm">
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

      {comparison && tierEstimates && comparison.offers.length > 0 && (
        <>
          <PriceSummary market={comparison.market} count={comparison.offers.length} tierEstimates={tierEstimates} />
          <SortTabs current={sort} params={{ tjanst, postnr: postnrRaw, regnr: regnrRaw }} />
          <div className="grid gap-4">
            {sorted.map((offer) => (
              <OfferCard
                key={offer.workshopId}
                offer={offer}
                highlights={highlightsFor(offer.workshopId)}
                compareHref={compareHref(offer.workshopId)}
              />
            ))}
          </div>
          <ValueExplainer />
        </>
      )}
    </div>
  );
}
