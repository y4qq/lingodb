import {
  FloatingPanel,
  FloatingPanelBody,
  FloatingPanelHeader,
  FloatingPanelLayout,
  FloatingPanelLayoutSide,
} from "@/components/ui/floating-panel";
import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesLoading() {
  return (
    <FloatingPanelLayout>
      <FloatingPanel className="flex-1">
        <FloatingPanelHeader>
          <Skeleton className="h-6 w-48" />
        </FloatingPanelHeader>
        <FloatingPanelBody>
          <Skeleton className="h-20 w-full rounded-none" />
          <Skeleton className="h-20 w-full rounded-none" />
          <Skeleton className="h-20 w-full rounded-none" />
        </FloatingPanelBody>
      </FloatingPanel>
      <FloatingPanelLayoutSide />
    </FloatingPanelLayout>
  );
}
