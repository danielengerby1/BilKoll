import type { ServiceCategory } from "../../src/lib/domain";

/** Standard jobs and the inputs for BilKoll's estimates (book time for an average car, typical parts incl. moms). */
export type ServiceSeed = {
  slug: string;
  titleSv: string;
  descriptionSv: string;
  category: ServiceCategory;
  /** Book time for an average car. */
  estimatedHours: number;
  /** Typical parts for an average car, SEK incl. moms. */
  typicalPartsSek: number;
};

export const SERVICES: ServiceSeed[] = [
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

