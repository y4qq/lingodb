import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Service files under lib/<domain>/service.ts are PRIVATE data access.
  // Only the domain's own queries/*, actions/*, or a route.ts controller
  // is allowed to import from them — this forces every caller through an
  // auth+validation boundary. The override below re-enables those imports
  // for the whitelisted paths.
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/domains/*/service"],
              message:
                "Import from @/lib/domains/<domain>/queries/* or @/lib/domains/<domain>/actions/* instead. Service files are private data access; route handlers (app/**/route.ts) may import them directly.",
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "lib/domains/*/queries/**/*.ts",
      "lib/domains/*/actions/**/*.ts",
      "lib/**/routes/**/*.ts",
      "app/**/route.ts",
    ],
    rules: {
      "no-restricted-imports": "off",
    },
  },
];

export default eslintConfig;
