import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma Client with the pg driver adapter (Rust-free query compiler).
 * Postgres everywhere: Supabase in production, any Postgres locally.
 */

const SUPABASE_HOST = /\.supabase\.(co|com)\b|pooler\.supabase\.com/;

/**
 * Supabase serves its own CA chain; node-postgres treats `sslmode=require` as
 * full verification and rejects it. Encrypt the connection but skip CA
 * verification for Supabase hosts only.
 */
export function pgConfig(url: string): { connectionString: string; ssl?: { rejectUnauthorized: boolean } } {
  if (!SUPABASE_HOST.test(url)) return { connectionString: url };
  const u = new URL(url);
  u.searchParams.delete("sslmode");
  u.searchParams.delete("pgbouncer");
  return { connectionString: u.toString(), ssl: { rejectUnauthorized: false } };
}

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return new PrismaClient({ adapter: new PrismaPg(pgConfig(url)) });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db: PrismaClient = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
