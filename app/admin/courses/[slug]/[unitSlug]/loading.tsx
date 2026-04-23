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

export default function Loading() {
  return (
    <FloatingPanelLayoutFull>
      <AdminPageHeader
        breadcrumbs={[{ href: "/admin/courses", label: "Courses" }]}
        title={<Skeleton className="h-6 w-56" />}
        action={<Skeleton className="h-9 w-24" />}
      />
      <FloatingPanel className="flex-1">
        <FloatingPanelHeader>
          <FloatingPanelTitle>Lessons</FloatingPanelTitle>
          <FloatingPanelHeaderAction>
            <Skeleton className="h-9 w-32" />
          </FloatingPanelHeaderAction>
        </FloatingPanelHeader>
        <FloatingPanelBody>
          <Skeleton className="h-24 w-full rounded-none" />
          <Skeleton className="h-24 w-full rounded-none" />
          <Skeleton className="h-24 w-full rounded-none" />
        </FloatingPanelBody>
      </FloatingPanel>
    </FloatingPanelLayoutFull>
  );
}
