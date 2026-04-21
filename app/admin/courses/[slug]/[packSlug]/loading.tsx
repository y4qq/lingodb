import { AdminPageHeaderSkeleton } from "@/components/admin/admin-page-header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <AdminPageHeaderSkeleton />
      <Skeleton className="h-64 w-full" />
    </>
  );
}
