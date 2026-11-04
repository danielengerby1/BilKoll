import type { WorkshopChain, WorkshopTier } from "../../src/lib/domain";

/**
 * Real workshops in Stockholms län – public business details only.
 * Collected 2026-11-04 from the listed sources. NO prices and NO ratings are
 * stored: BilKoll shows its own estimates (src/lib/estimate.ts).
 * Trust badges (Godkänd Bilverkstad, MRF) stay false until verified against
 * the official registers.
 */
export type WorkshopSeed = {
  slug: string;
  name: string;
  chain: WorkshopChain;
  tier: WorkshopTier;
  address: string;
  postalCode: string;
  city: string;
  municipality: string;
  phone?: string;
  website?: string;
  authorizedMakes?: string;
  sourceUrl: string;
};

export const WORKSHOPS_VERIFIED_AT = new Date("2026-11-04T12:00:00Z");

export const WORKSHOPS: readonly WorkshopSeed[] = [
  // ── Kedjeverkstäder ───────────────────────────────────────────────
  { slug: "mekonomen-norrtull", name: "Mekonomen Norrtull", chain: "MEKONOMEN", tier: "KEDJA", address: "Sveavägen 159", postalCode: "11346", city: "Stockholm", municipality: "Stockholm", phone: "08-503 088 11", website: "https://www.mekonomennorrtull.se", sourceUrl: "https://www.reco.se/mekonomen-norrtull" },
  { slug: "mekonomen-skarpnack", name: "Mekonomen Bilverkstad Skarpnäck Car Center", chain: "MEKONOMEN", tier: "KEDJA", address: "Fraktflygargatan 2", postalCode: "12830", city: "Skarpnäck", municipality: "Stockholm", phone: "08-502 200 08", website: "https://www.mekonomen.se", sourceUrl: "https://www.reco.se/skarpnack-car-center-ab" },
  { slug: "mekonomen-sundbyberg", name: "Sumpan Bilverkstad (Mekonomen)", chain: "MEKONOMEN", tier: "KEDJA", address: "Vegagatan 7", postalCode: "17234", city: "Sundbyberg", municipality: "Sundbyberg", phone: "08-627 92 02", website: "https://www.mekonomensundbyberg.se", sourceUrl: "https://www.reco.se/sumpan-bilverkstad-ab" },
  { slug: "mekonomen-haninge", name: "Mekonomen Haninge (Stavboms Service)", chain: "MEKONOMEN", tier: "KEDJA", address: "Markörgatan 8", postalCode: "13644", city: "Handen", municipality: "Haninge", phone: "08-777 24 30", website: "https://www.mekonomen.se", sourceUrl: "https://www.reco.se/mekonomen-haninge-handen" },
  { slug: "meca-kungsholmen", name: "MECA Kungsholmen", chain: "MECA", tier: "KEDJA", address: "Industrigatan 3", postalCode: "11246", city: "Stockholm", municipality: "Stockholm", phone: "070-606 04 66", website: "https://mecakungsholmen.se", sourceUrl: "https://www.reco.se/meca-kungsholmen" },
  { slug: "via-bilservice-autoexperten", name: "Via Bilservice – Autoexperten", chain: "AUTOEXPERTEN", tier: "KEDJA", address: "Grindsgatan 56", postalCode: "11857", city: "Stockholm", municipality: "Stockholm", phone: "08-644 26 10", website: "https://www.autoexperten.se", sourceUrl: "https://www.reco.se/via-bilservice-autoexperten" },
  { slug: "bodalsgaraget-autoexperten", name: "Bodalsgaraget (Autoexperten)", chain: "AUTOEXPERTEN", tier: "KEDJA", address: "Vasavägen 76", postalCode: "18141", city: "Lidingö", municipality: "Lidingö", phone: "08-765 01 99", website: "https://www.autoexperten.se", sourceUrl: "https://www.reco.se/bodalsgaraget-ab" },
  { slug: "hagmans-bilservice", name: "Hagmans Bilservice (Autoexperten)", chain: "AUTOEXPERTEN", tier: "KEDJA", address: "Söderby Gårdsväg 69", postalCode: "14451", city: "Rönninge", municipality: "Salem", phone: "08-530 340 10", website: "https://www.hagmans-bilservice.se", sourceUrl: "https://www.reco.se/hagmans-bilservice" },
  { slug: "svanhagens-bil-dackservice", name: "Svanhagens Bil & Däckservice (Autoexperten)", chain: "AUTOEXPERTEN", tier: "KEDJA", address: "Mörbyvägen 1 A", postalCode: "17975", city: "Skå", municipality: "Ekerö", phone: "08-560 240 00", website: "https://www.autoexperten.se", sourceUrl: "https://www.reco.se/svanhagens-bil-dackservice-ab" },
  { slug: "speedy-hogdalen", name: "Speedy Bilservice Högdalen", chain: "SPEEDY", tier: "KEDJA", address: "Rågsvedsvägen 6", postalCode: "12450", city: "Bandhagen", municipality: "Stockholm", phone: "08-99 23 80", website: "https://speedybilservice.se/verkstader/bandhagen/speedy-bilservice-hogdalen", sourceUrl: "https://www.reco.se/speedy-bilservice-hogdalen" },
  { slug: "speedy-fruangen", name: "Speedy Bilservice Fruängen", chain: "SPEEDY", tier: "KEDJA", address: "Elsa Brändströms gata 201", postalCode: "12952", city: "Hägersten", municipality: "Stockholm", phone: "08-97 66 65", website: "https://speedybilservice.se", sourceUrl: "https://www.reco.se/speedy-bilservice-fruangen" },
  { slug: "speedy-vallingby", name: "Speedy Bilservice Vällingby", chain: "SPEEDY", tier: "KEDJA", address: "Jämtlandsgatan 153", postalCode: "16260", city: "Vällingby", municipality: "Stockholm", phone: "08-37 75 05", website: "https://speedybilservice.se/verkstader/vallingby/speedy-bilservice-vallingby", sourceUrl: "https://www.reco.se/speedy-bilservice-vallingby" },
  { slug: "speedy-solna", name: "Speedy Bilservice Solna", chain: "SPEEDY", tier: "KEDJA", address: "Västra Vägen 13", postalCode: "16961", city: "Solna", municipality: "Solna", phone: "08-730 11 75", website: "https://speedybilservice.se", sourceUrl: "https://www.reco.se/speedy-bilservice-solna" },
  { slug: "speedy-ostermalm", name: "Speedy Bilservice Östermalm", chain: "SPEEDY", tier: "KEDJA", address: "Valhallavägen 161", postalCode: "11553", city: "Stockholm", municipality: "Stockholm", phone: "08-662 40 45", website: "https://speedybilservice.se", sourceUrl: "https://www.reco.se/speedy-bilservice-ostermalm" },
  { slug: "speedy-nacka", name: "Speedy Bilservice Nacka", chain: "SPEEDY", tier: "KEDJA", address: "Vattenverksvägen 4", postalCode: "13141", city: "Nacka", municipality: "Nacka", phone: "08-718 37 20", website: "https://www.speedybilservice.se", sourceUrl: "https://www.reco.se/speedy-bilservice-nacka" },
  { slug: "bosch-sodermalms-bilservice", name: "Bosch Car Service – Södermalms Bilservice", chain: "BOSCH", tier: "KEDJA", address: "Siargatan 9", postalCode: "11827", city: "Stockholm", municipality: "Stockholm", phone: "08-640 55 30", website: "https://sodermalmbilservice.se", sourceUrl: "https://www.reco.se/bosch-car-service-sodermalm-bilservice" },
  { slug: "okq8-nacka-dack-bilverkstad", name: "OKQ8 Bilverkstad – Nacka Däck och Bilverkstad", chain: "OKQ8", tier: "KEDJA", address: "Skvaltans Väg 17", postalCode: "13139", city: "Nacka", municipality: "Nacka", phone: "08-515 121 40", website: "https://nackabilverkstad.se", sourceUrl: "https://www.reco.se/nacka-dack-och-bilverkstad-ab" },

  // ── Fristående ────────────────────────────────────────────────────
  { slug: "vr-motor-stockholm", name: "VR Motor Stockholm", chain: "INDEPENDENT", tier: "FRISTAENDE", address: "Magelungsvägen 150", postalCode: "12459", city: "Bandhagen", municipality: "Stockholm", phone: "08-122 251 23", website: "https://www.vrmotor.se", sourceUrl: "https://www.reco.se/vr-motor-stockholm-bandhagen" },

  // ── Märkesverkstäder ──────────────────────────────────────────────
  { slug: "bilia-segeltorp-volvo", name: "Bilia Segeltorp Volvo", chain: "BILIA", tier: "MARKESVERKSTAD", address: "Häradsvägen 255", postalCode: "14172", city: "Segeltorp", municipality: "Huddinge", phone: "010-497 10 00", website: "https://www.bilia.se", authorizedMakes: "Volvo", sourceUrl: "https://www.reco.se/bilia-segeltorp-segeltorp-haradsvagen-255" },
  { slug: "bilia-alvik-volvo", name: "Bilia Alvik Volvo", chain: "BILIA", tier: "MARKESVERKSTAD", address: "Drottningholmsvägen 187", postalCode: "16753", city: "Bromma", municipality: "Stockholm", phone: "010-497 05 00", website: "https://www.bilia.se", authorizedMakes: "Volvo", sourceUrl: "https://www.reco.se/bilia-alvik-bromma-drottningholmsvagen-187" },
  { slug: "bilia-kungens-kurva-toyota", name: "Bilia Kungens Kurva Toyota", chain: "BILIA", tier: "MARKESVERKSTAD", address: "Ellipsvägen 4", postalCode: "14175", city: "Kungens Kurva", municipality: "Huddinge", phone: "08-706 72 50", website: "https://www.bilia.se", authorizedMakes: "Toyota", sourceUrl: "https://www.reco.se/bilia-kungen-kurva" },
  { slug: "bilia-nacka-bmw", name: "Bilia Nacka BMW", chain: "BILIA", tier: "MARKESVERKSTAD", address: "Jarlabergsvägen 2A", postalCode: "13151", city: "Nacka", municipality: "Nacka", phone: "08-505 781 00", website: "https://www.bilia.se", authorizedMakes: "BMW", sourceUrl: "https://www.reco.se/bilia-nacka-nacka-jarlabergsvagen-2" },
  { slug: "din-bil-smista-volkswagen", name: "Din Bil Volkswagen Smista", chain: "DIN_BIL", tier: "MARKESVERKSTAD", address: "Smista Allé 13", postalCode: "14174", city: "Segeltorp", municipality: "Huddinge", authorizedMakes: "Volkswagen", sourceUrl: "https://bilweb.se/bilhandlare/volkswagen-smista-nya-bilar" },
  { slug: "din-bil-smista-audi", name: "Din Bil Audi Smista", chain: "DIN_BIL", tier: "MARKESVERKSTAD", address: "Smista Allé 46–48", postalCode: "14174", city: "Segeltorp", municipality: "Huddinge", authorizedMakes: "Audi", sourceUrl: "https://www.leaseplan.com/-/media/leaseplan-digital/se/documents/1-damage-garage-list-2023-04-18.pdf" },
  { slug: "tesla-service-segeltorp", name: "Tesla Service Stockholm – Segeltorp", chain: "TESLA", tier: "MARKESVERKSTAD", address: "Lövbacksvägen 2", postalCode: "14171", city: "Segeltorp", municipality: "Huddinge", website: "https://www.tesla.com/sv_SE/findus/location/service/stockholmsegeltorp", authorizedMakes: "Tesla", sourceUrl: "https://www.tesla.com/en_GB/findus/location/service/stockholmsegeltorp" },
  { slug: "tesla-service-kanalvagen", name: "Tesla Service Stockholm – Kanalvägen", chain: "TESLA", tier: "MARKESVERKSTAD", address: "Kanalvägen 16", postalCode: "19461", city: "Upplands Väsby", municipality: "Upplands Väsby", website: "https://www.tesla.com/sv_SE/findus/location/service/stockholminfracity", authorizedMakes: "Tesla", sourceUrl: "https://www.tesla.com/sv_SE/findus/location/service/stockholminfracity" },
];
