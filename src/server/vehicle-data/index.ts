import { mockVehicleDataProvider } from "./mock";
import type { VehicleDataProvider } from "./types";

export type { VehicleDataProvider, VehicleRecord } from "./types";

export function getVehicleDataProvider(): VehicleDataProvider {
  const name = process.env.VEHICLE_DATA_PROVIDER ?? "mock";
  switch (name) {
    case "mock":
      return mockVehicleDataProvider;
    default:
      // Real adapters (biluppgifter, transportstyrelsen) plug in here and must
      // return the same VehicleRecord shape.
      throw new Error(`Unknown VEHICLE_DATA_PROVIDER "${name}"`);
  }
}
