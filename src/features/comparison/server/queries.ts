import "server-only";
import { db } from "@/server/db";
import { WorkshopChain, WorkshopTier, type PriceClass } from "@/lib/domain";
import { estimatePrice, marketEstimate, type PriceEstimate } from "@/lib/estimate";
import { distanceKm, postalCodeToLatLng } from "@/lib/geo";
import { rankOffers, type ComparisonSummary, type Offer } from "../ranking";

export function listServices() {
  return db.standardService.findMany({ orderBy: { sortOrder: "asc" } });
}

export function getServiceBySlug(slug: string) {
  return db.standardService.findUnique({ where: { slug } });
}

export type ComparisonQuery = {
  serviceSlug: string;
  postalCode: string | null;
  /** The user's car make – used to mark authorised workshops for that make. */
  make: string | null;
  priceClass: PriceClass;
};

export type ComparisonResult = ComparisonSummary & {
  postalCodeResolved: boolean;
  market: PriceEstimate;
};

export function isAuthorizedFor(authorizedMakes: string | null, make: string | null): boolean {
  if (!authorizedMakes || !make) return false;
  return authorizedMakes
    .split(",")
    .map((m) => m.trim().toLowerCase())
    .includes(make.toLowerCase());
}

export async function getComparison(query: ComparisonQuery): Promise<ComparisonResult | null> {
  const service = await getServiceBySlug(query.serviceSlug);
  if (!service) return null;

  const workshops = await db.workshop.findMany();
  const { point, resolved } = postalCodeToLatLng(query.postalCode);

  const offers: Offer[] = workshops
    // Brand workshops only for their own make: hide them when the user's car is another make.
    .filter((w) => !w.isAuthorized || !query.make || isAuthorizedFor(w.authorizedMakes, query.make))
    .map((w) => {
      const tier = WorkshopTier.catch("KEDJA").parse(w.tier);
      return {
        workshopId: w.id,
        workshopName: w.name,
        chain: WorkshopChain.catch("INDEPENDENT").parse(w.chain),
        tier,
        address: w.address,
        city: w.city,
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
    market: marketEstimate(service, query.priceClass),
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
