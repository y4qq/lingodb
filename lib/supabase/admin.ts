import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role Supabase client. Used ONLY for operations that require
// bypassing RLS / acting on behalf of no particular user — e.g. minting
// signed upload and download URLs for private Storage buckets.
//
// NEVER expose this client (or the key it uses) to the browser. Every call
// site must already have checked authorization (typically via requireAdmin).
//
// Cached across HMR reloads so each file change doesn't open a new client.

const globalForAdmin = globalThis as unknown as {
  __supabaseAdminClient?: SupabaseClient;
};

export function createAdminClient(): SupabaseClient {
  if (globalForAdmin.__supabaseAdminClient) {
    return globalForAdmin.__supabaseAdminClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Required for server-side " +
        "Storage operations.",
    );
  }

  const client = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  if (process.env.NODE_ENV !== "production") {
    globalForAdmin.__supabaseAdminClient = client;
  }

  return client;
}
