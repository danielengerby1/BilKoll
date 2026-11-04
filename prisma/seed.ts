/**
 * Seeds standard services (estimate inputs) and REAL workshops (public
 * business details only, see prisma/data/workshops.ts). No prices are seeded:
 * BilKoll computes estimates in src/lib/estimate.ts.
 *
 * Idempotent (upserts by slug) – runs on every deploy without touching
 * user data such as QuoteAudit.
 */
import { db } from "../src/server/db";
import { ServiceCategory, WorkshopChain, WorkshopTier } from "../src/lib/domain";
import { postalCodeToLatLng } from "../src/lib/geo";
import { WORKSHOPS, WORKSHOPS_VERIFIED_AT } from "./data/workshops";

type ServiceSeed = {
  slug: string;
  titleSv: string;
  descriptionSv: string;
  category: ServiceCategory;
  /** Book time for an average car. */
  estimatedHours: number;
  /** Typical parts for an average car, SEK incl. moms. */
  typicalPartsSek: number;
};

const SERVICES: ServiceSeed[] = [
  { slug: "bas-service", titleSv: "Bas-service", descriptionSv: "Oljebyte, oljefilter och säkerhetskontroll enligt serviceprogram.", category: "SERVICE", estimatedHours: 1.0, typicalPartsSek: 900 },
  { slug: "stor-service", titleSv: "Stor service", descriptionSv: "Bas-service plus luftfilter, kupéfilter, tändstift/bränslefilter enligt serviceprogram.", category: "SERVICE", estimatedHours: 2.0, typicalPartsSek: 1800 },
  { slug: "oljebyte", titleSv: "Oljebyte", descriptionSv: "Motorolja och oljefilter.", category: "SERVICE", estimatedHours: 0.5, typicalPartsSek: 700 },
  { slug: "bromsar-fram", titleSv: "Bromsskivor & belägg fram", descriptionSv: "Byte av bromsskivor och bromsbelägg på framaxeln.", category: "BROMSAR", estimatedHours: 1.3, typicalPartsSek: 1900 },
  { slug: "bromsar-bak", titleSv: "Bromsskivor & belägg bak", descriptionSv: "Byte av bromsskivor och bromsbelägg på bakaxeln.", category: "BROMSAR", estimatedHours: 1.2, typicalPartsSek: 1600 },
  { slug: "hjulskifte", titleSv: "Hjulskifte", descriptionSv: "Byte mellan sommar- och vinterhjul, inkl. kontroll av lufttryck.", category: "DACK", estimatedHours: 0.3, typicalPartsSek: 0 },
  { slug: "batteribyte", titleSv: "Batteribyte (12 V)", descriptionSv: "Nytt startbatteri inkl. montering och registrering vid behov.", category: "ELSYSTEM", estimatedHours: 0.5, typicalPartsSek: 1700 },
  { slug: "felsokning", titleSv: "Felsökning / felkodsläsning", descriptionSv: "Diagnos med testutrustning och genomgång av felkoder.", category: "DIAGNOS", estimatedHours: 0.7, typicalPartsSek: 0 },
  { slug: "ac-service", titleSv: "AC-service", descriptionSv: "Tömning, läcktest och påfyllning av köldmedium.", category: "SERVICE", estimatedHours: 0.8, typicalPartsSek: 500 },
  { slug: "kamremsbyte", titleSv: "Kamremsbyte", descriptionSv: "Kamrem, sträckare och vattenpump enligt tillverkarens rekommendation.", category: "SERVICE", estimatedHours: 4.0, typicalPartsSek: 3200 },
];

async function main() {
  for (const [i, s] of SERVICES.entries()) {
    const data = { ...s, category: ServiceCategory.parse(s.category), sortOrder: i };
    await db.standardService.upsert({ where: { slug: s.slug }, create: data, update: data });
  }

  for (const w of WORKSHOPS) {
    // Approximate position (postal-area centre) until addresses are geocoded.
    const { point } = postalCodeToLatLng(w.postalCode);
    const data = {
      slug: w.slug,
      name: w.name,
      chain: WorkshopChain.parse(w.chain),
      tier: WorkshopTier.parse(w.tier),
      address: w.address,
      postalCode: w.postalCode,
      city: w.city,
      municipality: w.municipality,
      lat: point.lat,
      lng: point.lng,
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
