import { ensureProfile } from "@/lib/auth/ensure-profile";
import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });
    if (!error) {
      if (!data.user) {
        redirect(`/auth/error?error=No%20user%20after%20verification`);
      }
      try {
        await ensureProfile(data.user);
      } catch (err) {
        console.error("Failed to ensure profile", data.user.id, err);
        redirect(`/auth/error?error=Profile%20creation%20failed`);
      }
      redirect(next);
    } else {
      redirect(`/auth/error?error=${error?.message}`);
    }
  }

  redirect(`/auth/error?error=No token hash or type`);
}
