import { Skeleton } from "@/components/ui/skeleton";

type PageHeaderSkeletonProps = {
  withDescription?: boolean;
  withAction?: boolean;
};

export function PageHeaderSkeleton({
  withDescription = true,
  withAction = false,
}: PageHeaderSkeletonProps) {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-4 w-56" />
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64" />
          {withDescription && <Skeleton className="h-4 w-80" />}
        </div>
        {withAction && <Skeleton className="h-9 w-32" />}
      </div>
    </div>
  );
}
