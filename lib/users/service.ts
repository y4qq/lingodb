import "server-only";
import { db } from "@/lib/db";
import { users } from "@/supabase/schema";

// Upserts the public.users row for an authenticated identity. Covers signup,
// invite, recovery, and email_change verification paths with a single call:
// inserts if missing, updates email if present (so an auth-side email change
// doesn't leave a stale mirror).
//
// Takes a plain {id, email} rather than a Supabase User object so the service
// has no dependency on @supabase/supabase-js — callable from any auth-success
// path (confirm route, future OAuth callback, admin backfill, tests).
export async function ensureProfile(input: { id: string; email: string }) {
  await db
    .insert(users)
    .values(input)
    .onConflictDoUpdate({
      target: users.id,
      set: { email: input.email },
    });
}
