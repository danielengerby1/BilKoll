import { createBiluppgifterProvider } from "./biluppgifter";
import { mockVehicleDataProvider } from "./mock";
import type { VehicleDataProvider } from "./types";

export type { VehicleDataProvider, VehicleRecord } from "./types";

/**
 * VEHICLE_DATA_PROVIDER: "mock" (default, demo cars) or "biluppgifter" (real
 * data, needs BILUPPGIFTER_API_KEY). Without a key we fall back to mock so the
 * demo keeps working, and the UI says the car is demo data.
 */
export function getVehicleDataProvider(): VehicleDataProvider {
  const name = process.env.VEHICLE_DATA_PROVIDER ?? "mock";
  if (name === "biluppgifter") {
    const key = process.env.BILUPPGIFTER_API_KEY;
    if (key) return createBiluppgifterProvider(key);
    console.warn("[vehicle-data] VEHICLE_DATA_PROVIDER=biluppgifter but BILUPPGIFTER_API_KEY is missing – using mock");
  }
  return mockVehicleDataProvider;
}

export function isRealVehicleData(): boolean {
  return process.env.VEHICLE_DATA_PROVIDER === "biluppgifter" && Boolean(process.env.BILUPPGIFTER_API_KEY);
}
