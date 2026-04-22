import "server-only";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/supabase/schema";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/domains/users/service";

export async function requireUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    redirect("/login");
  }
  return data.user;
}

export async function requireAdmin() {
  const { user, profile } = await requireUserWithProfile();
  if (profile.role !== "admin") {
    notFound();
  }
  return { user, profile };
}

export async function requireUserWithProfile() {
  const user = await requireUser();
  const profileColumns = {
    id: true,
    email: true,
    displayName: true,
    role: true,
    activeCourseId: true,
  } as const;

  let profile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
    columns: profileColumns,
  });

  if (!profile) {
    // Lazy-create the public.users mirror row for any authenticated identity
    // that slipped past the /auth/confirm path (confirmations disabled in
    // local dev, OAuth, admin-created users, etc.). ensureProfile is an
    // idempotent upsert, so this is safe to run on every missing-profile hit.
    if (!user.email) {
      redirect("/error?error=Profile%20missing");
    }
    await ensureProfile({ id: user.id, email: user.email });
    profile = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      columns: profileColumns,
    });
    if (!profile) {
      redirect("/error?error=Profile%20missing");
    }
  }

  return { user, profile };
}

export async function getProfileIfAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const profile = await db.query.users.findFirst({
    where: eq(users.id, data.user.id),
    columns: { id: true, email: true, displayName: true, role: true },
  });
  if (!profile || profile.role !== "admin") return null;
  return profile;
}
