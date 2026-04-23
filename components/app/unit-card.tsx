import Link from "next/link";
import { FloatingPanelCard } from "@/components/ui/floating-panel";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  unitNumber: number;
  title: string;
  description?: string | null;
};

export function UnitCard({ href, unitNumber, title, description }: Props) {
  return (
    <FloatingPanelCard asChild>
      <Link href={href}>
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md bg-chart-2 font-heading text-sm font-black text-white",
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
    </FloatingPanelCard>
  );
}
