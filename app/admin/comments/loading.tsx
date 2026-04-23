import { AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  FloatingPanel,
  FloatingPanelBody,
  FloatingPanelHeader,
  FloatingPanelLayoutFull,
  FloatingPanelTitle,
} from "@/components/ui/floating-panel";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <FloatingPanelLayoutFull>
      <AdminPageHeader title="Comments" />
      <FloatingPanel className="flex-1">
        <FloatingPanelHeader>
          <FloatingPanelTitle>Moderation queue</FloatingPanelTitle>
        </FloatingPanelHeader>
        <div className="shrink-0 border-b-2 border-border px-6">
          <Skeleton className="my-4 h-6 w-96" />
        </div>
        <FloatingPanelBody>
          <Skeleton className="h-24 w-full rounded-none" />
          <Skeleton className="h-24 w-full rounded-none" />
          <Skeleton className="h-24 w-full rounded-none" />
        </FloatingPanelBody>
      </FloatingPanel>
    </FloatingPanelLayoutFull>
  );
}
