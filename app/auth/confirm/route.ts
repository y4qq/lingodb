import { ensureProfile } from "@/lib/users/service";
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
        redirect(`/error?error=No%20user%20after%20verification`);
      }
      if (!data.user.email) {
        redirect(`/error?error=User%20has%20no%20email`);
      }
      try {
        await ensureProfile({ id: data.user.id, email: data.user.email });
      } catch (err) {
        console.error("Failed to ensure profile", data.user.id, err);
        redirect(`/error?error=Profile%20creation%20failed`);
      }
      redirect(next);
    } else {
      redirect(`/error?error=${error?.message}`);
    }
  }

  redirect(`/error?error=No token hash or type`);
}
