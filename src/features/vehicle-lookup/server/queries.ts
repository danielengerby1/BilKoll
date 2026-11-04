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
  const record = await provider.lookup(regnr);
  if (!record) return cached;

  const data = { ...record, dataSource: provider.name, fetchedAt: new Date() };
  return db.vehicle.upsert({ where: { regnr }, create: data, update: data });
}
