import { AdminShortcut } from "@/components/auth/admin-shortcut";
import { AuthButton } from "@/components/auth/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Suspense } from "react";

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5 text-sm">
          <Link href="/courses" className="font-semibold">
            Fluent Fast
          </Link>
          <div className="flex items-center gap-3">
            <Suspense>
              <AdminShortcut />
            </Suspense>
            <Suspense>
              <AuthButton />
            </Suspense>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
        {children}
      </main>
      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-end px-5 py-4">
          <ThemeSwitcher />
        </div>
      </footer>
    </div>
  );
}
