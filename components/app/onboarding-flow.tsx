"use client";

import { useActionState, useState, useTransition } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { completeOnboarding } from "@/lib/domains/users/actions/user";
import { createClient } from "@/lib/supabase/client";

type Props = {
  initialDisplayName: string | null;
};

export function OnboardingFlow({ initialDisplayName }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialDisplayName ?? "");

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const [state, action, pending] = useActionState(
    completeOnboarding,
    undefined,
  );
  const [, startTransition] = useTransition();

  const trimmedName = name.trim();
  const canContinue = trimmedName.length > 0 && !pending;

  const error = state && !state.ok ? (state.error ?? null) : null;
  const fieldError =
    state && !state.ok ? state.fieldErrors?.name?.[0] : undefined;

  function handleContinue() {
    const fd = new FormData();
    fd.append("name", trimmedName);
    startTransition(() => action(fd));
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-border flex items-center gap-4 border-b-2 px-6 py-4">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-foreground h-14 gap-2 px-4 text-base font-medium [&_svg:not([class*='size-'])]:size-6"
        >
          <LogOut />
          <span>Logout</span>
        </Button>
        <div className="min-w-0 flex-1 px-4 text-center">
          <p className="text-muted-foreground text-xs uppercase tracking-widest">
            Welcome
          </p>
        </div>
        <div aria-hidden="true" className="h-14 w-[140px] shrink-0" />
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-lg flex-col gap-6">
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              What should we call you?
            </h1>
            <p className="text-muted-foreground text-sm">
              This is how you&apos;ll show up across Fluent Fast. You can
              change it later.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (canContinue) handleContinue();
            }}
            className="flex flex-col gap-2"
          >
            <Input
              id="display-name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sam"
              maxLength={60}
              autoFocus
              disabled={pending}
            />
            {fieldError && (
              <p className="text-destructive text-xs">{fieldError}</p>
            )}
            {error && !fieldError && (
              <p className="text-destructive text-xs">{error}</p>
            )}
          </form>
        </div>
      </main>

      <footer className="border-border flex min-h-20 items-center justify-center border-t-2 px-6 py-4">
        <Button
          type="button"
          size="lg"
          className="h-14 px-8 text-base"
          onClick={handleContinue}
          disabled={!canContinue}
        >
          {pending ? "Saving…" : "Continue"}
        </Button>
      </footer>
    </div>
  );
}
