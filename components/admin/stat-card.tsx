import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: number | string;
  className?: string;
};

export function StatCard({ label, value, className }: StatCardProps) {
  return (
    <Card size="sm" className={cn("rounded-lg shadow-lg", className)}>
      <div className="flex items-baseline justify-between gap-3 px-4">
        <span className="font-heading text-xl font-medium tracking-tight text-muted-foreground">
          {label}
        </span>
        <span className="font-heading text-xl font-bold tracking-tight tabular-nums">
          {value}
        </span>
      </div>
    </Card>
  );
}
