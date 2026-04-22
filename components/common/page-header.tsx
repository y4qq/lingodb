import type { ReactNode } from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export type Crumb = { href?: string; label: string };

type PageHeaderProps = {
  breadcrumbs: Crumb[];
  title: string;
  meta?: ReactNode;
  description?: string;
  action?: ReactNode;
};

export function PageHeader({
  breadcrumbs,
  title,
  meta,
  description,
  action,
}: PageHeaderProps) {
  const trail: Crumb[] = [...breadcrumbs, { label: title }];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <Breadcrumb>
              <BreadcrumbList className="gap-2 text-2xl tracking-tight sm:gap-3 [&>li>svg]:size-5">
                {trail.map((crumb, i) => {
                  const isLast = i === trail.length - 1;
                  return (
                    <span key={`${crumb.label}-${i}`} className="contents">
                      <BreadcrumbItem>
                        {crumb.href && !isLast ? (
                          <BreadcrumbLink asChild>
                            <Link href={crumb.href}>{crumb.label}</Link>
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage className="font-semibold text-foreground">
                            {crumb.label}
                          </BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator />}
                    </span>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
            {meta}
          </div>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
