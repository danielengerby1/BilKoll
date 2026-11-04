import { parseBiluppgifterVehicle } from "./biluppgifter-parse";
import type { VehicleDataProvider } from "./types";

/**
 * Real vehicle lookup via Biluppgifter (https://apidocs.biluppgifter.se).
 * Requests vehicle packages only – never owner data.
 */
const BASE_URL = "https://api.biluppgifter.se/api/v1";
const PACKAGES = "basic,technical,inspection,status";

export function createBiluppgifterProvider(apiKey: string): VehicleDataProvider {
  return {
    name: "biluppgifter",
    async lookup(regnr) {
      const url = `${BASE_URL}/vehicle/regno/${encodeURIComponent(regnr)}?include=${PACKAGES}&active=1`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
          "User-Agent": "BilKoll/1.0 (+https://bilkoll-nu.vercel.app)",
        },
        // Vehicle data changes rarely; we also cache in our DB for 30 days.
        next: { revalidate: 86_400 },
        signal: AbortSignal.timeout(8_000),
      });
      if (res.status === 404) return null;
      if (!res.ok) {
        // 401 bad key, 403 quota, 429 rate limit, 5xx outage – never leak the key.
        console.error(`[vehicle-data] biluppgifter ${res.status} for lookup`);
        throw new Error(`Vehicle lookup failed (${res.status})`);
      }
      return parseBiluppgifterVehicle(regnr, await res.json());
    },
  };
}
