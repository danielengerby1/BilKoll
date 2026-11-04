import "server-only";
import { db } from "@/server/db";
import { distanceKm, postalCodeToLatLng } from "@/lib/geo";
import { median } from "@/lib/money";
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
};

export type ComparisonResult = ComparisonSummary & { postalCodeResolved: boolean };

function isAuthorizedFor(authorizedMakes: string | null, make: string | null): boolean {
  if (!authorizedMakes || !make) return false;
  return authorizedMakes
    .split(",")
    .map((m) => m.trim().toLowerCase())
    .includes(make.toLowerCase());
}

export async function getComparison(query: ComparisonQuery): Promise<ComparisonResult | null> {
  const service = await getServiceBySlug(query.serviceSlug);
  if (!service) return null;

  const prices = await db.workshopServicePrice.findMany({
    where: { serviceId: service.id },
    include: { workshop: true },
  });

  const { point, resolved } = postalCodeToLatLng(query.postalCode);

  const offers: Offer[] = prices
    // Authorised dealers for other makes rarely service your car – hide them.
    .filter((p) => !p.workshop.isAuthorized || !query.make || isAuthorizedFor(p.workshop.authorizedMakes, query.make))
    .map((p) => ({
      workshopId: p.workshop.id,
      workshopName: p.workshop.name,
      city: p.workshop.city,
      laborSek: p.fixedPriceSek,
      partsSek: p.partsPriceSek,
      totalSek: p.fixedPriceSek + p.partsPriceSek,
      noteSv: p.noteSv,
      hourlyRateSek: p.workshop.hourlyRateSek,
      distanceKm: distanceKm(point, { lat: p.workshop.lat, lng: p.workshop.lng }),
      rating: p.workshop.rating,
      reviewCount: p.workshop.reviewCount,
      nextAvailableAt: p.workshop.nextAvailableAt,
      isGodkandBilverkstad: p.workshop.isGodkandBilverkstad,
      isMrf: p.workshop.isMrf,
      isAuthorized: p.workshop.isAuthorized,
      isAuthorizedForMake: isAuthorizedFor(p.workshop.authorizedMakes, query.make),
    }));

  return { ...rankOffers(offers), postalCodeResolved: resolved };
}

export type ServicePriceRange = { slug: string; minSek: number; medianSek: number; count: number };

/** "Från X kr" per service – for the car page and the home page. */
export async function getServicePriceRanges(): Promise<Map<string, ServicePriceRange>> {
  const rows = await db.workshopServicePrice.findMany({
    select: { fixedPriceSek: true, partsPriceSek: true, service: { select: { slug: true } } },
  });
  const bySlug = new Map<string, number[]>();
  for (const r of rows) {
    const list = bySlug.get(r.service.slug) ?? [];
    list.push(r.fixedPriceSek + r.partsPriceSek);
    bySlug.set(r.service.slug, list);
  }
  const out = new Map<string, ServicePriceRange>();
  for (const [slug, totals] of bySlug) {
    out.set(slug, { slug, minSek: Math.min(...totals), medianSek: median(totals) ?? 0, count: totals.length });
  }
  return out;
}

export function getWorkshopWithPrices(id: string) {
  return db.workshop.findUnique({
    where: { id },
    include: { prices: { include: { service: true }, orderBy: { service: { sortOrder: "asc" } } } },
  });
}
