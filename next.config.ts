import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native/driver packages must not be bundled.
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3", "@prisma/adapter-pg", "pg"],
};

export default nextConfig;
