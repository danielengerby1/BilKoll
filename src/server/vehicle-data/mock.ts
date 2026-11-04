import { CAR_MODEL_GUIDES } from "@/lib/car-models";
import type { FuelType, Transmission } from "@/lib/domain";
import type { VehicleDataProvider, VehicleRecord } from "./types";

/** Hand-picked demo cars, so the same regnr always shows the same car in demos. */
const KNOWN: Record<string, Omit<VehicleRecord, "regnr" | "nextInspection"> & { inspectionInDays: number }> = {
  ABC123: { make: "Volvo", model: "XC60", variant: "B4 AWD", year: 2020, fuelType: "DIESEL", transmission: "AUTOMAT", engineCode: "D420T8", inspectionInDays: 45 },
  DEF456: { make: "Volkswagen", model: "Golf", variant: "1.5 TSI", year: 2019, fuelType: "BENSIN", transmission: "MANUELL", engineCode: "DADA", inspectionInDays: 120 },
  GHJ78A: { make: "Tesla", model: "Model Y", variant: "Long Range", year: 2022, fuelType: "EL", transmission: "AUTOMAT", engineCode: null, inspectionInDays: 300 },
  KLM901: { make: "Toyota", model: "RAV4", variant: "2.5 Hybrid AWD-i", year: 2021, fuelType: "HYBRID", transmission: "AUTOMAT", engineCode: "A25A-FXS", inspectionInDays: 12 },
  NOP234: { make: "Volvo", model: "V60", variant: "T6 Recharge", year: 2021, fuelType: "LADDHYBRID", transmission: "AUTOMAT", engineCode: "B4204T", inspectionInDays: 200 },
};

function hash(s: string): number {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return h >>> 0;
}

function addDays(days: number): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/** Deterministic fake: any valid regnr resolves to one of the common cars. */
export const mockVehicleDataProvider: VehicleDataProvider = {
  name: "mock",
  async lookup(regnr) {
    const known = KNOWN[regnr];
    if (known) {
      const { inspectionInDays, ...rest } = known;
      return { regnr, ...rest, nextInspection: addDays(inspectionInDays) };
    }
    const h = hash(regnr);
    const guide = CAR_MODEL_GUIDES[h % CAR_MODEL_GUIDES.length];
    if (!guide) return null;
    const fuelType: FuelType = guide.fuelTypes[h % guide.fuelTypes.length] ?? "BENSIN";
    const span = guide.years.to - guide.years.from + 1;
    const transmission: Transmission = fuelType === "EL" || h % 3 !== 0 ? "AUTOMAT" : "MANUELL";
    return {
      regnr,
      make: guide.make,
      model: guide.model,
      variant: null,
      year: guide.years.from + (h % span),
      fuelType,
      transmission,
      engineCode: null,
      nextInspection: addDays(h % 400),
    };
  },
};
