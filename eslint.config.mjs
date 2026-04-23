import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // ESLint 9 flat config no longer reads .eslintignore, and the Next preset
  // no longer injects ignores automatically. Without this block, `yarn lint`
  // scans generated Next.js output and produces thousands of bogus errors.
  { ignores: ["**/.next/**", "next-env.d.ts"] },
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
    // Whitelist for paths that are themselves boundary layers and may import
    // domain services directly:
    //   - queries/actions: the canonical per-domain boundary
    //   - lib/**/routes: route handlers mounted by app/**/route.ts
    //   - app/**/route.ts: Next.js route handlers
    //   - lib/auth/**: auth guards (requireUser, requireAdmin, etc.) are
    //     the first line of defense for every server component/page/action
    //     and legitimately need cross-domain access (e.g. ensureProfile).
    files: [
      "lib/domains/*/queries/**/*.ts",
      "lib/domains/*/actions/**/*.ts",
      "lib/**/routes/**/*.ts",
      "lib/auth/**/*.ts",
      "app/**/route.ts",
    ],
    rules: {
      "no-restricted-imports": "off",
    },
  },
];

export default eslintConfig;
