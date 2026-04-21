import Link from "next/link";
import { Suspense } from "react";
import { AuthButton } from "@/components/auth/auth-button";
import { requireAdmin } from "@/lib/auth/guards";

// Outer layout is sync so Next's Cache Components can prerender the shell.
// The async admin guard lives inside a Suspense boundary — if the caller is
// not admin the guard redirects / 404s before the chrome renders.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminShellFallback />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}

async function AdminShell({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5 text-sm">
          <nav className="flex items-center gap-6">
            <Link href="/admin" className="font-semibold">
              Admin
            </Link>
            <Link
              href="/admin/courses"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Courses
            </Link>
          </nav>
          <Suspense>
            <AuthButton />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
        {children}
      </main>
    </div>
  );
}

function AdminShellFallback() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <div className="mx-auto h-16 w-full max-w-5xl" />
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
        <div className="bg-muted/30 h-24 animate-pulse rounded-xl" />
      </main>
    </div>
  );
}
