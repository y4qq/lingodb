import { Suspense } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { requireAdmin } from "@/lib/auth/guards";

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
  const { profile } = await requireAdmin();

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AdminSidebar
          userEmail={profile.email}
          userName={profile.displayName}
        />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-6 p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

function AdminShellFallback() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Skeleton className="h-24 w-full max-w-md" />
    </div>
  );
}
