import { z } from "zod";

/**
 * The ONLY place where allowed values for "enum" String columns live.
 * Validate with these schemas before writing to the database.
 */

export const FuelType = z.enum(["BENSIN", "DIESEL", "EL", "HYBRID", "LADDHYBRID", "ETANOL", "GAS", "OKAND"]);
export type FuelType = z.infer<typeof FuelType>;

export const FUEL_TYPE_LABEL_SV: Record<FuelType, string> = {
  BENSIN: "Bensin",
  DIESEL: "Diesel",
  EL: "El",
  HYBRID: "Hybrid",
  LADDHYBRID: "Laddhybrid",
  ETANOL: "Etanol",
  GAS: "Gas",
  OKAND: "Okänt drivmedel",
};

export const Transmission = z.enum(["MANUELL", "AUTOMAT"]);
export type Transmission = z.infer<typeof Transmission>;

export const TRANSMISSION_LABEL_SV: Record<Transmission, string> = {
  MANUELL: "Manuell",
  AUTOMAT: "Automat",
};

export const WorkshopChain = z.enum([
  "MEKONOMEN",
  "MECA",
  "AUTOEXPERTEN",
  "SPEEDY",
  "BOSCH",
  "OKQ8",
  "BILIA",
  "DIN_BIL",
  "HEDIN",
  "VOLVO",
  "TESLA",
  "INDEPENDENT",
]);
export type WorkshopChain = z.infer<typeof WorkshopChain>;

export const WORKSHOP_CHAIN_LABEL_SV: Record<WorkshopChain, string> = {
  MEKONOMEN: "Mekonomen",
  MECA: "MECA",
  AUTOEXPERTEN: "Autoexperten",
  SPEEDY: "Speedy Bilservice",
  BOSCH: "Bosch Car Service",
  OKQ8: "OKQ8 Bilverkstad",
  BILIA: "Bilia",
  DIN_BIL: "Din Bil",
  HEDIN: "Hedin Automotive",
  VOLVO: "Volvo Car",
  TESLA: "Tesla",
  INDEPENDENT: "Fristående",
};

/** Drives the price estimate. Brand dealers cost more than chains, chains more than independents. */
export const WorkshopTier = z.enum(["MARKESVERKSTAD", "KEDJA", "FRISTAENDE"]);
export type WorkshopTier = z.infer<typeof WorkshopTier>;

export const WORKSHOP_TIER_LABEL_SV: Record<WorkshopTier, string> = {
  MARKESVERKSTAD: "Märkesverkstad",
  KEDJA: "Kedjeverkstad",
  FRISTAENDE: "Fristående verkstad",
};

/**
 * ESTIMATE ASSUMPTIONS (SEK incl. moms). Not workshop prices.
 * Hourly-rate bands per tier inside the Stockholm band, and a multiplier on
 * typical parts cost (dealers use OE parts, independents often aftermarket).
 * Calibrate against real submitted quotes (QuoteAudit.workshopId) over time.
 */
export const TIER_ESTIMATE: Record<WorkshopTier, { rateSek: { min: number; max: number }; parts: { min: number; max: number } }> = {
  MARKESVERKSTAD: { rateSek: { min: 1800, max: 2200 }, parts: { min: 1.1, max: 1.35 } },
  KEDJA: { rateSek: { min: 1400, max: 1850 }, parts: { min: 0.95, max: 1.15 } },
  FRISTAENDE: { rateSek: { min: 1200, max: 1700 }, parts: { min: 0.85, max: 1.1 } },
};

export const GeoPrecision = z.enum(["ADDRESS", "STREET", "POSTAL"]);
export type GeoPrecision = z.infer<typeof GeoPrecision>;

/** Premium cars: more expensive parts and slightly longer jobs. */
export const PriceClass = z.enum(["STANDARD", "PREMIUM"]);
export type PriceClass = z.infer<typeof PriceClass>;
export const PRICE_CLASS_FACTOR: Record<PriceClass, { hours: number; parts: number }> = {
  STANDARD: { hours: 1, parts: 1 },
  PREMIUM: { hours: 1.1, parts: 1.3 },
};

export const ServiceCategory = z.enum(["SERVICE", "BROMSAR", "DACK", "ELSYSTEM", "DIAGNOS"]);
export type ServiceCategory = z.infer<typeof ServiceCategory>;

export const SERVICE_CATEGORY_LABEL_SV: Record<ServiceCategory, string> = {
  SERVICE: "Service",
  BROMSAR: "Bromsar",
  DACK: "Däck & hjul",
  ELSYSTEM: "Elsystem",
  DIAGNOS: "Felsökning",
};

/** Signal for a quote the user received, compared with our estimate. */
export const AuditVerdict = z.enum(["BILLIGT", "BRA_VARDE", "DYRT"]);
export type AuditVerdict = z.infer<typeof AuditVerdict>;

export const AUDIT_VERDICT_LABEL_SV: Record<AuditVerdict, string> = {
  BILLIGT: "Billigt",
  BRA_VARDE: "Bra värde",
  DYRT: "Dyrt",
};

export const Urgency = z.enum(["LAG", "MEDEL", "HOG"]);
export type Urgency = z.infer<typeof Urgency>;

export const URGENCY_LABEL_SV: Record<Urgency, string> = {
  LAG: "Ingen brådska",
  MEDEL: "Boka tid snart",
  HOG: "Sluta köra – kontakta verkstad",
};

export const SortMode = z.enum(["BAST_VARDE", "LAGST_PRIS", "NARMAST"]);
export type SortMode = z.infer<typeof SortMode>;

export const SORT_MODE_LABEL_SV: Record<SortMode, string> = {
  BAST_VARDE: "Bäst värde",
  LAGST_PRIS: "Lägst uppskattat pris",
  NARMAST: "Närmast",
};

/** Workshop-type filter on "Hitta verkstad". */
export const WorkshopFilter = z.enum(["ALLA", "OBEROENDE", "MARKE"]);
export type WorkshopFilter = z.infer<typeof WorkshopFilter>;

export const WORKSHOP_FILTER_LABEL_SV: Record<WorkshopFilter, string> = {
  ALLA: "Alla",
  OBEROENDE: "Kedjor & fristående",
  MARKE: "Märkesverkstäder",
};

/** Posted hourly rates in Stockholms län, SEK incl. moms. */
export const STOCKHOLM_HOURLY_RATE_SEK = { min: 1200, max: 2200, typical: 1650 } as const;

/** Sergels torg – fallback when we can't resolve the user's postal code. */
export const STOCKHOLM_CENTRAL = { lat: 59.3326, lng: 18.0649 } as const;
