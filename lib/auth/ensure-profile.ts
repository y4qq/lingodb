import "server-only";
import type { User } from "@supabase/supabase-js";
import { db } from "@/lib/db";
import { users } from "@/supabase/schema";

// Upserts the public.users row for an authenticated Supabase user.
// Covers signup, invite, recovery, and email_change verification paths with
// a single call: inserts if missing, updates email if present (so a change
// in auth.users.email doesn't leave a stale mirror).
export async function ensureProfile(user: User) {
  if (!user.email) {
    throw new Error(`Cannot create profile for ${user.id}: no email on user`);
  }

  await db
    .insert(users)
    .values({ id: user.id, email: user.email })
    .onConflictDoUpdate({
      target: users.id,
      set: { email: user.email },
    });
}
