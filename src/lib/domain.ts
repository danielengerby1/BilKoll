import { z } from "zod";

/**
 * The ONLY place where allowed values for "enum" String columns live.
 * Validate with these schemas before writing to the database.
 */

export const FuelType = z.enum(["BENSIN", "DIESEL", "EL", "HYBRID", "LADDHYBRID", "ETANOL", "GAS"]);
export type FuelType = z.infer<typeof FuelType>;

export const FUEL_TYPE_LABEL_SV: Record<FuelType, string> = {
  BENSIN: "Bensin",
  DIESEL: "Diesel",
  EL: "El",
  HYBRID: "Hybrid",
  LADDHYBRID: "Laddhybrid",
  ETANOL: "Etanol",
  GAS: "Gas",
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
  "BILIA",
  "HEDIN",
  "VOLVO",
  "INDEPENDENT",
]);
export type WorkshopChain = z.infer<typeof WorkshopChain>;

export const ServiceCategory = z.enum(["SERVICE", "BROMSAR", "DACK", "ELSYSTEM", "DIAGNOS"]);
export type ServiceCategory = z.infer<typeof ServiceCategory>;

export const SERVICE_CATEGORY_LABEL_SV: Record<ServiceCategory, string> = {
  SERVICE: "Service",
  BROMSAR: "Bromsar",
  DACK: "Däck & hjul",
  ELSYSTEM: "Elsystem",
  DIAGNOS: "Felsökning",
};

export const AuditVerdict = z.enum(["RIMLIGT", "NAGOT_HOGT", "FOR_HOGT", "MISSTANKT_MERFORSALJNING"]);
export type AuditVerdict = z.infer<typeof AuditVerdict>;

export const AUDIT_VERDICT_LABEL_SV: Record<AuditVerdict, string> = {
  RIMLIGT: "Rimligt pris",
  NAGOT_HOGT: "Något högt",
  FOR_HOGT: "För högt",
  MISSTANKT_MERFORSALJNING: "Misstänkt merförsäljning",
};

/** Higher = worse for the customer. Used to pick the stricter of two verdicts. */
export const AUDIT_VERDICT_SEVERITY: Record<AuditVerdict, number> = {
  RIMLIGT: 0,
  NAGOT_HOGT: 1,
  FOR_HOGT: 2,
  MISSTANKT_MERFORSALJNING: 3,
};

export const BookingStatus = z.enum(["SKICKAD", "BEKRAFTAD", "AVBOKAD"]);
export type BookingStatus = z.infer<typeof BookingStatus>;

export const Urgency = z.enum(["LAG", "MEDEL", "HOG"]);
export type Urgency = z.infer<typeof Urgency>;

export const URGENCY_LABEL_SV: Record<Urgency, string> = {
  LAG: "Ingen brådska",
  MEDEL: "Boka tid snart",
  HOG: "Sluta köra – kontakta verkstad",
};

export const SortMode = z.enum(["BAST_VARDE", "LAGST_PRIS", "NARMAST", "TIDIGAST", "BETYG"]);
export type SortMode = z.infer<typeof SortMode>;

export const SORT_MODE_LABEL_SV: Record<SortMode, string> = {
  BAST_VARDE: "Bäst värde",
  LAGST_PRIS: "Lägst pris",
  NARMAST: "Närmast",
  TIDIGAST: "Tidigaste tid",
  BETYG: "Högst betyg",
};

/** Posted hourly rates in Stockholms län, SEK incl. moms. */
export const STOCKHOLM_HOURLY_RATE_SEK = { min: 1200, max: 2200, typical: 1650 } as const;

/** Sergels torg – fallback when we can't resolve the user's postal code. */
export const STOCKHOLM_CENTRAL = { lat: 59.3326, lng: 18.0649 } as const;
