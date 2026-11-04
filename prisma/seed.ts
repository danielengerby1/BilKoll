/**
 * Demo data for Stockholms län.
 * Workshop names are FICTIONAL and prices are generated – the UI shows a
 * "Demodata" banner until real price feeds are connected.
 */
import { db } from "../src/server/db";
import { ServiceCategory, WorkshopChain } from "../src/lib/domain";
import { postalCodeToLatLng } from "../src/lib/geo";

type ServiceSeed = {
  slug: string;
  titleSv: string;
  descriptionSv: string;
  category: ServiceCategory;
  estimatedHours: number;
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

type WorkshopSeed = {
  name: string;
  chain?: WorkshopChain;
  address: string;
  city: string;
  municipality: string;
  postalCode: string;
  hourlyRateSek: number;
  /** Multiplier on typical parts cost. */
  partsMarkup: number;
  rating: number;
  reviewCount: number;
  godkand?: boolean;
  mrf?: boolean;
  authorizedMakes?: string;
  nextAvailableInDays: number;
  /** Services not offered. */
  skip?: string[];
};

const WORKSHOPS: WorkshopSeed[] = [
  { name: "Söderorts Bilservice", address: "Årstaängsvägen 9", city: "Årsta", municipality: "Stockholm", postalCode: "12053", hourlyRateSek: 1495, partsMarkup: 1.0, rating: 4.6, reviewCount: 212, godkand: true, mrf: true, nextAvailableInDays: 2 },
  { name: "Kungens Kurva Motorcenter", address: "Ekgårdsvägen 4", city: "Kungens Kurva", municipality: "Huddinge", postalCode: "14175", hourlyRateSek: 1395, partsMarkup: 0.95, rating: 4.3, reviewCount: 388, godkand: true, nextAvailableInDays: 1 },
  { name: "Solna Bilverkstad", address: "Industrivägen 12", city: "Solna", municipality: "Solna", postalCode: "17148", hourlyRateSek: 1650, partsMarkup: 1.05, rating: 4.7, reviewCount: 156, godkand: true, mrf: true, nextAvailableInDays: 4 },
  { name: "Nacka Motor & Däck", address: "Järnvägsgatan 3", city: "Nacka", municipality: "Nacka", postalCode: "13134", hourlyRateSek: 1550, partsMarkup: 1.0, rating: 4.4, reviewCount: 97, godkand: true, nextAvailableInDays: 3, skip: ["kamremsbyte"] },
  { name: "Bromma Bilteknik", address: "Ulvsundavägen 22", city: "Bromma", municipality: "Stockholm", postalCode: "16866", hourlyRateSek: 1750, partsMarkup: 1.1, rating: 4.8, reviewCount: 301, godkand: true, mrf: true, nextAvailableInDays: 6 },
  { name: "Täby Bilcenter", address: "Enhagsvägen 7", city: "Täby", municipality: "Täby", postalCode: "18766", hourlyRateSek: 1690, partsMarkup: 1.05, rating: 4.5, reviewCount: 143, godkand: true, nextAvailableInDays: 5 },
  { name: "Sollentuna Mekaniska", address: "Bergkällavägen 18", city: "Sollentuna", municipality: "Sollentuna", postalCode: "19162", hourlyRateSek: 1450, partsMarkup: 1.0, rating: 4.2, reviewCount: 64, mrf: true, nextAvailableInDays: 2 },
  { name: "Järfälla Bil & Service", address: "Veddestavägen 15", city: "Järfälla", municipality: "Järfälla", postalCode: "17561", hourlyRateSek: 1350, partsMarkup: 0.95, rating: 4.1, reviewCount: 88, godkand: true, nextAvailableInDays: 1 },
  { name: "Haninge Motorservice", address: "Måsvägen 2", city: "Handen", municipality: "Haninge", postalCode: "13644", hourlyRateSek: 1295, partsMarkup: 0.95, rating: 4.4, reviewCount: 119, godkand: true, nextAvailableInDays: 3 },
  { name: "Östermalms Bilservice", address: "Valhallavägen 120", city: "Stockholm", municipality: "Stockholm", postalCode: "11432", hourlyRateSek: 2095, partsMarkup: 1.2, rating: 4.6, reviewCount: 74, godkand: true, mrf: true, nextAvailableInDays: 8 },
  { name: "Nordväg Bil Sundbyberg", chain: "VOLVO", address: "Landsvägen 40", city: "Sundbyberg", municipality: "Sundbyberg", postalCode: "17266", hourlyRateSek: 1995, partsMarkup: 1.2, rating: 4.5, reviewCount: 420, godkand: true, mrf: true, authorizedMakes: "Volvo,Polestar", nextAvailableInDays: 9 },
  { name: "Mälardalens Tyska Bilar", address: "Smista Allé 3", city: "Segeltorp", municipality: "Huddinge", postalCode: "14175", hourlyRateSek: 2050, partsMarkup: 1.25, rating: 4.3, reviewCount: 265, godkand: true, mrf: true, authorizedMakes: "Volkswagen,Audi,Skoda", nextAvailableInDays: 7 },
  { name: "Liljeholmens Snabbservice", address: "Lövholmsvägen 5", city: "Stockholm", municipality: "Stockholm", postalCode: "11760", hourlyRateSek: 1595, partsMarkup: 1.0, rating: 4.0, reviewCount: 210, mrf: true, nextAvailableInDays: 0, skip: ["kamremsbyte", "ac-service"] },
  { name: "Skärholmens Bil & Däck", address: "Bredholmsgatan 8", city: "Skärholmen", municipality: "Stockholm", postalCode: "12730", hourlyRateSek: 1200, partsMarkup: 0.9, rating: 3.6, reviewCount: 41, nextAvailableInDays: 1, skip: ["kamremsbyte"] },
  { name: "Vällingby Bilreparationer", address: "Kirunagatan 30", city: "Vällingby", municipality: "Stockholm", postalCode: "16261", hourlyRateSek: 2200, partsMarkup: 1.6, rating: 3.4, reviewCount: 29, nextAvailableInDays: 2 },
  { name: "Elbilsverkstan Kista", address: "Färögatan 11", city: "Kista", municipality: "Stockholm", postalCode: "16440", hourlyRateSek: 1595, partsMarkup: 1.0, rating: 4.7, reviewCount: 133, godkand: true, nextAvailableInDays: 4, skip: ["kamremsbyte", "oljebyte"] },
];

/** Small deterministic jitter so prices don't look machine-made (±6 %). */
function jitter(seed: string): number {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return 0.94 + ((h % 1000) / 1000) * 0.12;
}

/** Round to a "shop price" ending in 0 or 5 kr. */
const shopPrice = (n: number) => Math.max(0, Math.round(n / 5) * 5);

function slotInDays(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  // Workshops are closed at weekends – move to Monday.
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  d.setHours(8 + (days % 3) * 2, 0, 0, 0);
  return d;
}

async function main() {
  await db.bookingRequest.deleteMany();
  await db.quoteAudit.deleteMany();
  await db.workshopServicePrice.deleteMany();
  await db.workshop.deleteMany();
  await db.standardService.deleteMany();

  const services = [];
  for (const [i, s] of SERVICES.entries()) {
    services.push(
      await db.standardService.create({
        data: {
          slug: s.slug,
          titleSv: s.titleSv,
          descriptionSv: s.descriptionSv,
          category: ServiceCategory.parse(s.category),
          estimatedHours: s.estimatedHours,
          sortOrder: i,
        },
      }),
    );
  }

  for (const [i, w] of WORKSHOPS.entries()) {
    const { point } = postalCodeToLatLng(w.postalCode);
    const workshop = await db.workshop.create({
      data: {
        name: w.name,
        chain: WorkshopChain.parse(w.chain ?? "INDEPENDENT"),
        address: w.address,
        city: w.city,
        municipality: w.municipality,
        postalCode: w.postalCode,
        // Spread workshops sharing a postal area a little.
        lat: point.lat + ((i % 5) - 2) * 0.004,
        lng: point.lng + ((i % 3) - 1) * 0.006,
        isGodkandBilverkstad: w.godkand ?? false,
        isMrf: w.mrf ?? false,
        isAuthorized: Boolean(w.authorizedMakes),
        authorizedMakes: w.authorizedMakes ?? null,
        hourlyRateSek: w.hourlyRateSek,
        rating: w.rating,
        reviewCount: w.reviewCount,
        nextAvailableAt: slotInDays(w.nextAvailableInDays),
      },
    });

    for (const s of SERVICES) {
      if (w.skip?.includes(s.slug)) continue;
      const service = services.find((x) => x.slug === s.slug);
      if (!service) continue;
      const j = jitter(`${w.name}:${s.slug}`);
      await db.workshopServicePrice.create({
        data: {
          workshopId: workshop.id,
          serviceId: service.id,
          fixedPriceSek: shopPrice(s.estimatedHours * w.hourlyRateSek * j),
          partsPriceSek: shopPrice(s.typicalPartsSek * w.partsMarkup * (2 - j)),
          noteSv: s.slug.includes("service") || s.slug === "oljebyte" ? "Inkl. miljöavgift" : null,
        },
      });
    }
  }

  console.log(`Seeded ${services.length} services and ${WORKSHOPS.length} workshops.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
