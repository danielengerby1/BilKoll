import "server-only";
import { db } from "@/server/db";
import { WorkshopChain, WorkshopTier, type PriceClass, type WorkshopFilter } from "@/lib/domain";
import { estimatePrice, marketEstimate, type PriceEstimate } from "@/lib/estimate";
import { distanceKm, postalCodeToLatLng, type LatLng } from "@/lib/geo";
import { collectMakes, isAuthorizedFor, shouldShowWorkshop } from "../filter";
import { rankOffers, type ComparisonSummary, type Offer } from "../ranking";

export { isAuthorizedFor } from "../filter";

export function listServices() {
  return db.standardService.findMany({ orderBy: { sortOrder: "asc" } });
}

export function getServiceBySlug(slug: string) {
  return db.standardService.findUnique({ where: { slug } });
}

export type ComparisonQuery = {
  serviceSlug: string;
  postalCode: string | null;
  /** Car make – from the looked-up car or the brand picker. */
  make: string | null;
  filter: WorkshopFilter;
  priceClass: PriceClass;
};

export type ComparisonResult = ComparisonSummary & {
  postalCodeResolved: boolean;
  origin: LatLng;
  market: PriceEstimate;
  /** Every make we have brand workshops for (brand picker). */
  makes: string[];
  /** Brand workshops available for the chosen make (shown in the filter). */
  dealerCountForMake: number;
};

export async function getComparison(query: ComparisonQuery): Promise<ComparisonResult | null> {
  const service = await getServiceBySlug(query.serviceSlug);
  if (!service) return null;

  const workshops = await db.workshop.findMany();
  const { point, resolved } = postalCodeToLatLng(query.postalCode);

  const offers: Offer[] = workshops
    .filter((w) => shouldShowWorkshop(w, query.filter, query.make))
    .map((w) => {
      const tier = WorkshopTier.catch("KEDJA").parse(w.tier);
      return {
        workshopId: w.id,
        workshopName: w.name,
        chain: WorkshopChain.catch("INDEPENDENT").parse(w.chain),
        tier,
        address: w.address,
        city: w.city,
        lat: w.lat,
        lng: w.lng,
        authorizedMakes: w.authorizedMakes,
        phone: w.phone,
        website: w.website,
        estimate: estimatePrice(service, tier, query.priceClass),
        distanceKm: distanceKm(point, { lat: w.lat, lng: w.lng }),
        isGodkandBilverkstad: w.isGodkandBilverkstad,
        isMrf: w.isMrf,
        isAuthorizedForMake: isAuthorizedFor(w.authorizedMakes, query.make),
      };
    });

  return {
    ...rankOffers(offers),
    postalCodeResolved: resolved,
    origin: point,
    market: marketEstimate(service, query.priceClass),
    makes: collectMakes(workshops),
    dealerCountForMake: query.make ? workshops.filter((w) => isAuthorizedFor(w.authorizedMakes, query.make)).length : 0,
  };
}

/** Stockholm-wide estimate per service – for "ca X–Y kr" lists. */
export async function getServiceEstimates(priceClass: PriceClass = "STANDARD"): Promise<Map<string, PriceEstimate>> {
  const services = await listServices();
  return new Map(services.map((s) => [s.slug, marketEstimate(s, priceClass)]));
}

export function getWorkshop(id: string) {
  return db.workshop.findUnique({ where: { id } });
}

export function listWorkshopsForSelect() {
  return db.workshop.findMany({ select: { id: true, name: true, city: true }, orderBy: { name: "asc" } });
}
