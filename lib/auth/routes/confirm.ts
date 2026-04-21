import "server-only";
import * as Sentry from "@sentry/nextjs";
import { type NextRequest } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/domains/users/service";

// Handler for GET /auth/confirm — the URL users land on after clicking the
// confirmation link in a signup / invite / recovery / email-change email.

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (!token_hash || !type) {
    redirect(errorUrl("No token hash or type"));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });

  if (error) {
    redirect(errorUrl(error.message));
  }

  if (!data.user) {
    redirect(errorUrl("No user after verification"));
  }

  if (!data.user.email) {
    redirect(errorUrl("User has no email"));
  }

  try {
    await ensureProfile({ id: data.user.id, email: data.user.email });
  } catch (err) {
    Sentry.captureException(err, {
      extra: { route: "auth/confirm", userId: data.user.id },
    });
    redirect(errorUrl("Profile creation failed"));
  }

  redirect(next);
}

function errorUrl(message: string) {
  return `/error?error=${encodeURIComponent(message)}`;
}
