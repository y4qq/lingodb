import "server-only";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/supabase/schema";
import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    redirect("/login");
  }
  return data.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  const profile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    columns: { id: true, email: true, displayName: true, role: true },
  });
  if (!profile) {
    redirect("/error?error=Profile%20missing");
  }
  if (profile.role !== "admin") {
    notFound();
  }
  return { user, profile };
}
