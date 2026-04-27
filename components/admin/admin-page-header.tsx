import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type AdminCrumb = { href?: string; label: string };

type Props = {
  breadcrumbs?: AdminCrumb[];
  title: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function AdminPageHeader({
  breadcrumbs = [],
  title,
  action,
  className,
}: Props) {
  const rootCrumb = breadcrumbs[0];
  const middleCrumbs = breadcrumbs.slice(1);
  const hasMiddle = middleCrumbs.length > 0;

  return (
    <header
      className={cn(
        "flex h-[70px] shrink-0 items-center justify-between gap-4 rounded-none border-0 bg-background px-6 shadow-lg lg:rounded-lg lg:border-2 lg:border-border",
        className,
      )}
    >
      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <ol className="flex min-w-0 items-center gap-2 font-heading text-xl font-bold tracking-tight sm:gap-3">
          {rootCrumb && (
            <>
              <Crumb crumb={rootCrumb} />
              <Separator />
            </>
          )}
          {hasMiddle &&
            middleCrumbs.map((crumb, i) => (
              <Fragment key={`expanded-${i}`}>
                <Crumb crumb={crumb} className="hidden lg:inline-flex" />
                <Separator className="hidden lg:inline-flex" />
              </Fragment>
            ))}
          {hasMiddle && (
            <>
              <li className="shrink-0 lg:hidden">
                <EllipsisMenu items={middleCrumbs} />
              </li>
              <Separator className="lg:hidden" />
            </>
          )}
          <li className="flex min-w-0 items-center gap-3 text-foreground">
            {title}
          </li>
        </ol>
      </nav>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

function Crumb({
  crumb,
  className,
}: {
  crumb: AdminCrumb;
  className?: string;
}) {
  return (
    <li className={cn("flex shrink-0 items-center", className)}>
      {crumb.href ? (
        <Link
          href={crumb.href}
          className="block max-w-[14ch] truncate text-muted-foreground transition-colors hover:text-foreground sm:max-w-[20ch]"
        >
          {crumb.label}
        </Link>
      ) : (
        <span className="block max-w-[14ch] truncate text-muted-foreground sm:max-w-[20ch]">
          {crumb.label}
        </span>
      )}
    </li>
  );
}

function Separator({ className }: { className?: string }) {
  return (
    <li
      aria-hidden
      className={cn("flex shrink-0 items-center", className)}
    >
      <ChevronRight className="size-5 text-muted-foreground" />
    </li>
  );
}

function EllipsisMenu({ items }: { items: AdminCrumb[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Show breadcrumb trail"
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MoreHorizontal className="size-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {items.map((crumb, i) =>
          crumb.href ? (
            <DropdownMenuItem key={i} asChild>
              <Link href={crumb.href}>{crumb.label}</Link>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem key={i} disabled>
              {crumb.label}
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
