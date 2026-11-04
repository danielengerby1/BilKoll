import "server-only";
import { db } from "@/server/db";
import { getVehicleDataProvider } from "@/server/vehicle-data";
import { isValidRegnr, normalizeRegnr } from "@/lib/regnr";
import type { Vehicle } from "@prisma/client";

/** Cached lookups older than this are refreshed from the provider. */
const CACHE_TTL_MS = 30 * 86_400_000;

/** Resolve a car from cache or the vehicle data provider. Returns null for invalid/unknown regnr. */
export async function getOrFetchVehicle(rawRegnr: string): Promise<Vehicle | null> {
  if (!isValidRegnr(rawRegnr)) return null;
  const regnr = normalizeRegnr(rawRegnr);

  const cached = await db.vehicle.findUnique({ where: { regnr } });
  if (cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS) return cached;

  const provider = getVehicleDataProvider();
  let record;
  try {
    record = await provider.lookup(regnr);
  } catch (err) {
    // Provider down, quota or rate limit: serve the (possibly stale) cache rather than failing the page.
    console.error("[vehicle-lookup] provider failed", err instanceof Error ? err.message : err);
    return cached;
  }
  if (!record) return cached;

  const data = { ...record, dataSource: provider.name, fetchedAt: new Date() };
  return db.vehicle.upsert({ where: { regnr }, create: data, update: data });
}
