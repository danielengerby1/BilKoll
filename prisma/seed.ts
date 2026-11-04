/**
 * Seeds standard services (estimate inputs) and REAL workshops (public
 * business details only, see prisma/data/workshops.ts). No prices are seeded:
 * BilKoll computes estimates in src/lib/estimate.ts.
 *
 * Idempotent (upserts by slug) – runs on every deploy without touching
 * user data such as QuoteAudit.
 */
import { db } from "../src/server/db";
import { GeoPrecision, ServiceCategory, WorkshopChain, WorkshopTier } from "../src/lib/domain";
import { SERVICES } from "./data/services";
import { WORKSHOPS, WORKSHOPS_VERIFIED_AT } from "./data/workshops";

async function main() {
  for (const [i, s] of SERVICES.entries()) {
    const data = { ...s, category: ServiceCategory.parse(s.category), sortOrder: i };
    await db.standardService.upsert({ where: { slug: s.slug }, create: data, update: data });
  }

  for (const w of WORKSHOPS) {
    const data = {
      slug: w.slug,
      name: w.name,
      chain: WorkshopChain.parse(w.chain),
      tier: WorkshopTier.parse(w.tier),
      address: w.address,
      postalCode: w.postalCode,
      city: w.city,
      municipality: w.municipality,
      lat: w.lat,
      lng: w.lng,
      geoPrecision: GeoPrecision.parse(w.geoPrecision),
      phone: w.phone ?? null,
      website: w.website ?? null,
      isAuthorized: Boolean(w.authorizedMakes),
      authorizedMakes: w.authorizedMakes ?? null,
      sourceUrl: w.sourceUrl,
      verifiedAt: WORKSHOPS_VERIFIED_AT,
    };
    await db.workshop.upsert({ where: { slug: w.slug }, create: data, update: data });
  }

  console.log(`Seeded ${SERVICES.length} services and ${WORKSHOPS.length} real workshops.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
