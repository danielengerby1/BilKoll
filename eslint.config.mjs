import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "prisma/*.db*"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@anthropic-ai/sdk",
              message: "Use getAIService() from @/server/ai. The SDK is only allowed in src/server/ai/providers/.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/server/ai/providers/**"],
    rules: { "no-restricted-imports": "off" },
  },
];

export default eslintConfig;
