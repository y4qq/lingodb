import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
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
  }));

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar
          userEmail={profile.email}
          userName={profile.displayName}
          enrollments={navItems}
        />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-6 p-6">{children}</div>
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
