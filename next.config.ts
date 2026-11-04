import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: false,
  // Native/driver packages must not be bundled.
  serverExternalPackages: ["@prisma/client", ".prisma/client", "@prisma/adapter-pg", "pg"],
  // Prisma's query compiler is a .wasm file loaded at runtime; make sure Vercel ships it with every function.
  outputFileTracingIncludes: {
    "/**": ["./node_modules/.prisma/client/**/*.wasm", "./node_modules/.prisma/client/*.js"],
  },
};

export default nextConfig;
