import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to .env.local.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./supabase/schema.ts",
  out: "./supabase/migrations",
  migrations: {
    prefix: "timestamp",
  },
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
