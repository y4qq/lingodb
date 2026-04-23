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
      <AdminPageHeader title="Courses" />
      <FloatingPanel className="flex-1">
        <FloatingPanelHeader>
          <FloatingPanelTitle>All courses</FloatingPanelTitle>
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
    </FloatingPanelLayoutFull>
  );
}
