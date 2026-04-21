import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Paths reachable without an active session. Everything else is gated by the
// middleware redirect below. `/auth/` stays public because it's where route
// handlers live (email confirmation today, OAuth callbacks tomorrow) — not
// because pages live there.
const PUBLIC_PATH_PREFIXES = [
  "/login",
  "/sign-up",
  "/sign-up-success",
  "/forgot-password",
  "/update-password",
  "/error",
  "/auth/",
] as const;

// Paths meant only for unauthenticated visitors: marketing home plus the auth
// flow entry points. A logged-in visit bounces to /courses. `/update-password`
// is deliberately NOT here — it's the final step of the password-reset flow,
// at which point the user IS authenticated and should be allowed to set a new
// password. `/error` stays accessible in either state.
const UNAUTH_ONLY_PATH_PREFIXES = [
  "/login",
  "/sign-up", // also covers /sign-up-success via prefix match
  "/forgot-password",
] as const;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const pathname = request.nextUrl.pathname;
  const isPublic =
    pathname === "/" ||
    PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isUnauthOnly =
    pathname === "/" ||
    UNAUTH_ONLY_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isUnauthOnly) {
    const url = request.nextUrl.clone();
    url.pathname = "/courses";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
