import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/supabase/schema";
import * as relations from "@/supabase/relations";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env.local (local dev uses " +
      "postgresql://postgres:postgres@127.0.0.1:54322/postgres).",
  );
}

// Cache the postgres client across HMR reloads so each file change doesn't
// open a new pool.
const globalForDb = globalThis as unknown as {
  __drizzleClient?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.__drizzleClient ??
  postgres(connectionString, {
    // Required for transaction-mode poolers (Supabase's port 6543). Harmless
    // against direct connections on port 5432 / local 54322.
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__drizzleClient = client;
}

export const db = drizzle(client, {
  schema: { ...schema, ...relations },
});

export type Db = typeof db;
