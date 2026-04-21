import type { ReactNode } from "react";

type AdminToolbarProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  headingLevel?: "h1" | "h2";
};

export function AdminToolbar({
  title,
  description,
  action,
  headingLevel = "h1",
}: AdminToolbarProps) {
  const Heading = headingLevel;
  const titleClass =
    headingLevel === "h1"
      ? "text-2xl font-semibold tracking-tight"
      : "text-lg font-medium";

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <Heading className={titleClass}>{title}</Heading>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
