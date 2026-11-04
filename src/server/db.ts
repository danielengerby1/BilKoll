import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma Client with a driver adapter (Rust-free query compiler).
 * SQLite in dev, PostgreSQL/Supabase in prod – chosen from DATABASE_URL.
 */

/** Prisma CLI resolves "file:./dev.db" relative to prisma/; do the same at runtime. */
export function resolveSqliteUrl(url: string): string {
  const file = url.replace(/^file:/, "");
  return path.isAbsolute(file) ? file : path.join(process.cwd(), "prisma", file);
}

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  const adapter = url.startsWith("postgres")
    ? new PrismaPg({ connectionString: url })
    : new PrismaBetterSQLite3({ url: resolveSqliteUrl(url) });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db: PrismaClient = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
