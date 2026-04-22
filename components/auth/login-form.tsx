"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { isAuthApiError } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type UnconfirmedState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [resend, setResend] = useState<UnconfirmedState>({ kind: "idle" });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    setUnconfirmed(false);
    setResend({ kind: "idle" });

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/courses");
    } catch (err: unknown) {
      if (isAuthApiError(err) && err.code === "email_not_confirmed") {
        setUnconfirmed(true);
      } else {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setResend({ kind: "error", message: "Enter your email first." });
      return;
    }
    const supabase = createClient();
    setResend({ kind: "sending" });
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/courses`,
      },
    });
    if (error) {
      setResend({ kind: "error", message: error.message });
      return;
    }
    setResend({ kind: "sent" });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {unconfirmed && (
                <UnconfirmedNotice
                  state={resend}
                  onResend={handleResend}
                />
              )}
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="underline underline-offset-4"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function UnconfirmedNotice({
  state,
  onResend,
}: {
  state: UnconfirmedState;
  onResend: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-amber-300/60 bg-amber-50 p-3 text-sm text-amber-900">
      <p className="font-medium">Confirm your email to continue</p>
      <p className="text-amber-800">
        We sent a confirmation link to your inbox. Click it to finish setting
        up your account, then come back and log in.
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onResend}
          disabled={state.kind === "sending"}
        >
          {state.kind === "sending" ? "Sending…" : "Resend email"}
        </Button>
        {state.kind === "sent" && (
          <span className="text-xs">Sent — check your inbox.</span>
        )}
        {state.kind === "error" && (
          <span className="text-destructive text-xs">{state.message}</span>
        )}
      </div>
    </div>
  );
}
