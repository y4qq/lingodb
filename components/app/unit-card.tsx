import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  unitNumber: number;
  title: string;
  description?: string | null;
};

export function UnitCard({ href, unitNumber, title, description }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-4 rounded-2xl border-2 border-border bg-card px-5 py-6 text-left",
        "transition-colors hover:border-foreground/20",
        "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring/50",
      )}
    >
      <div
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-md font-heading text-xs font-black bg-chart-2 text-white"
        )}
      >
        {unitNumber}
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="font-heading text-base font-semibold">{title}</div>
        {description && (
          <div className="text-base text-muted-foreground">{description}</div>
        )}
      </div>
    </Link>
  );
}
