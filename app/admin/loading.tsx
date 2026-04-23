import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  FloatingPanel,
  FloatingPanelBody,
  FloatingPanelHeader,
  FloatingPanelHeaderAction,
  FloatingPanelLayoutFull,
  FloatingPanelTitle,
} from "@/components/ui/floating-panel";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <FloatingPanelLayoutFull>
      <AdminPageHeader title="Dashboard" />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <FloatingPanel className="lg:col-span-2">
          <FloatingPanelHeader>
            <FloatingPanelTitle>Recent courses</FloatingPanelTitle>
            <FloatingPanelHeaderAction>
              <Skeleton className="h-9 w-36" />
            </FloatingPanelHeaderAction>
          </FloatingPanelHeader>
          <FloatingPanelBody>
            <Skeleton className="h-24 w-full rounded-none" />
            <Skeleton className="h-24 w-full rounded-none" />
            <Skeleton className="h-24 w-full rounded-none" />
          </FloatingPanelBody>
        </FloatingPanel>

        <FloatingPanel>
          <FloatingPanelHeader>
            <FloatingPanelTitle>Pending moderation</FloatingPanelTitle>
            <FloatingPanelHeaderAction>
              <Skeleton className="h-5 w-16" />
            </FloatingPanelHeaderAction>
          </FloatingPanelHeader>
          <FloatingPanelBody>
            <Skeleton className="h-20 w-full rounded-none" />
            <Skeleton className="h-20 w-full rounded-none" />
            <Skeleton className="h-20 w-full rounded-none" />
          </FloatingPanelBody>
        </FloatingPanel>
      </section>
    </FloatingPanelLayoutFull>
  );
}
