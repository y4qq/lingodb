import {
  FloatingPanel,
  FloatingPanelBody,
  FloatingPanelHeader,
  FloatingPanelLayoutFull,
} from "@/components/ui/floating-panel";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <FloatingPanelLayoutFull>
      <FloatingPanel className="flex-1 rounded-none border-0 shadow-lg lg:rounded-xl lg:border-2">
        <FloatingPanelHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-80" />
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
