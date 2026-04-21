import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Returns the authenticated Supabase user. Redirects to the login page if
// there's no active session. Call this at the top of any server component,
// server action, or route handler that requires a logged-in user.
//
// The middleware in /proxy.ts already gates most routes; this is the
// in-code narrow that gives callers a non-null User without another null
// check everywhere.
export async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    redirect("/login");
  }
  return data.user;
}
