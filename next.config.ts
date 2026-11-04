import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native/driver packages must not be bundled.
  serverExternalPackages: ["@prisma/adapter-pg", "pg"],
};

export default nextConfig;
