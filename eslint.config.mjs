import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // FE code talks to the backend only through @/server/<feature> functions.
    files: ["src/app/**", "src/components/**"],
    ignores: ["src/app/auth/**", "src/app/api/**"], // BE-owned route handlers
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [{
          group: ["@supabase/*", "@/server/supabase/*"],
          message: "FE không gọi Supabase trực tiếp — dùng hàm trong @/server/<feature>.",
        }],
      }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
