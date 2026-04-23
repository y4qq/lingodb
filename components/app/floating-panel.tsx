import { cn } from "@/lib/utils";

export function FloatingPanel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-md border-2 border-border bg-background",
        className,
      )}
    >
      {children}
    </div>
  );
}
