import "server-only";
import * as Sentry from "@sentry/nextjs";
import { type NextRequest } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/domains/users/service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/courses";

  if (!token_hash || !type) {
    redirect(verifyErrorUrl("Missing confirmation token."));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });

  if (error) {
    redirect(verifyErrorUrl(error.message));
  }

  if (!data.user) {
    redirect(verifyErrorUrl("We couldn't find your account after verification."));
  }

  if (!data.user.email) {
    redirect(verifyErrorUrl("Your account has no email on file."));
  }

  try {
    await ensureProfile({ id: data.user.id, email: data.user.email });
  } catch (err) {
    Sentry.captureException(err, {
      extra: { route: "auth/confirm", userId: data.user.id },
    });
    redirect(verifyErrorUrl("We couldn't finish setting up your account."));
  }

  redirect(`/auth/verified?next=${encodeURIComponent(next)}`);
}

function verifyErrorUrl(message: string) {
  return `/auth/verify-error?reason=${encodeURIComponent(message)}`;
}
