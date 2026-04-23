import Link from "next/link";
import { FloatingPanelCard } from "@/components/ui/floating-panel";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  icon: string | null;
  title: string;
  description?: string | null;
};

export function UnitCard({ href, icon, title, description }: Props) {
  return (
    <FloatingPanelCard asChild>
      <Link href={href}>
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center text-4xl leading-none",
          )}
        >
          {icon ?? ""}
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
