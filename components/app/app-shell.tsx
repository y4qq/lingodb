import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { requireUserWithProfile } from "@/lib/auth/guards";
import { listMyEnrollments } from "@/lib/domains/users/queries/user";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AppShellFallback />}>
      <AppShellInner>{children}</AppShellInner>
    </Suspense>
  );
}

async function AppShellInner({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUserWithProfile();
  if (!profile.onboardedAt) {
    redirect("/onboarding");
  }
  const enrollments = await listMyEnrollments();

  const navItems = enrollments.map((e) => ({
    id: e.courseId,
    slug: e.course.slug,
    title: e.course.title,
    targetLanguageCode: e.course.targetLanguage.code,
  }));

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar
          userEmail={profile.email}
          userName={profile.displayName}
          enrollments={navItems}
          isAdmin={profile.role === "admin"}
        />
        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b-2 border-border bg-background px-4 md:hidden">
            <SidebarTrigger />
            <span className="inline-flex items-center gap-2">
              <span className="inline-flex size-6 items-center justify-center rounded-[0.25rem] bg-[var(--primary-400)] font-heading text-base font-extrabold text-white shadow-sm">
                <span>F</span>
                <span className="-ml-1 rotate-180">F</span>
              </span>
              <span className="font-heading text-base font-extrabold tracking-tight leading-none">
                FluentFast
              </span>
            </span>
          </header>
          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

function AppShellFallback() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Skeleton className="h-24 w-full max-w-md" />
    </div>
  );
}
