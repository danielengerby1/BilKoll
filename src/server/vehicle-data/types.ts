import { z } from "zod";
import { FuelType, Transmission } from "@/lib/domain";

/** Shape every adapter (mock, Biluppgifter, Transportstyrelsen) must return. */
export const VehicleRecord = z.object({
  regnr: z.string(),
  make: z.string(),
  model: z.string(),
  variant: z.string().nullable(),
  year: z.number().int().min(1950).max(2100),
  fuelType: FuelType,
  transmission: Transmission.nullable(),
  engineCode: z.string().nullable(),
  nextInspection: z.date().nullable(),
});
export type VehicleRecord = z.infer<typeof VehicleRecord>;

export interface VehicleDataProvider {
  readonly name: string;
  /** `regnr` is already normalised. Returns null when the car isn't found. */
  lookup(regnr: string): Promise<VehicleRecord | null>;
}
