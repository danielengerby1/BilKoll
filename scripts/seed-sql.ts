/**
 * Prints the seed as idempotent SQL (upsert by slug) – for applying the seed
 * through the Supabase SQL editor / MCP instead of a direct DB connection.
 * Usage: npx tsx scripts/seed-sql.ts > seed.sql
 */
import { SERVICES } from "../prisma/data/services";
import { WORKSHOPS, WORKSHOPS_VERIFIED_AT } from "../prisma/data/workshops";

const q = (v: string | null | undefined) => (v == null ? "NULL" : `'${v.replace(/'/g, "''")}'`);
const set = (cols: string[]) => cols.map((c) => `"${c}"=EXCLUDED."${c}"`).join(",");

const serviceCols = ["titleSv", "descriptionSv", "category", "estimatedHours", "typicalPartsSek", "sortOrder"];
const services = SERVICES.map(
  (s, i) =>
    `(gen_random_uuid()::text,${q(s.slug)},${q(s.titleSv)},${q(s.descriptionSv)},${q(s.category)},${s.estimatedHours},${s.typicalPartsSek},${i})`,
).join(",\n");

const workshopCols = ["name", "chain", "tier", "address", "postalCode", "city", "municipality", "lat", "lng", "geoPrecision", "phone", "website", "isAuthorized", "authorizedMakes", "sourceUrl", "verifiedAt", "updatedAt"];
const verified = q(WORKSHOPS_VERIFIED_AT.toISOString());
const workshops = WORKSHOPS.map((w) => {
  return `(gen_random_uuid()::text,${q(w.slug)},${q(w.name)},${q(w.chain)},${q(w.tier)},${q(w.address)},${q(w.postalCode)},${q(w.city)},${q(w.municipality)},${w.lat},${w.lng},${q(w.geoPrecision)},${q(w.phone)},${q(w.website)},${Boolean(w.authorizedMakes)},${q(w.authorizedMakes)},${q(w.sourceUrl)},${verified},now())`;
}).join(",\n");

console.log(`INSERT INTO "StandardService" ("id","slug",${serviceCols.map((c) => `"${c}"`).join(",")}) VALUES
${services}
ON CONFLICT ("slug") DO UPDATE SET ${set(serviceCols)};

INSERT INTO "Workshop" ("id","slug",${workshopCols.map((c) => `"${c}"`).join(",")}) VALUES
${workshops}
ON CONFLICT ("slug") DO UPDATE SET ${set(workshopCols)};`);
