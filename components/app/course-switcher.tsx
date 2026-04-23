"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronsUpDown, Library, Plus } from "lucide-react";
import type { EnrollmentNavItem } from "@/components/app/app-sidebar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type Props = {
  enrollments: EnrollmentNavItem[];
  activeSlug: string | null;
};

export function CourseSwitcher({ enrollments, activeSlug }: Props) {
  const [open, setOpen] = useState(false);
  const active = enrollments.find((e) => e.slug === activeSlug);
  const label = active?.title ?? "Select course";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <SidebarMenuButton
              tooltip={label}
              className="rounded-none border-b-2 border-border px-6 h-14 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Library />
              <span className="flex-1 truncate text-left">{label}</span>
              <ChevronsUpDown className="ml-auto size-4 opacity-60" />
            </SidebarMenuButton>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            side="top"
            className="w-(--radix-popover-trigger-width) min-w-56 gap-1 p-1"
          >
            <div className="text-muted-foreground px-2 pt-1.5 pb-1 text-xs font-medium">
              Your courses
            </div>
            {enrollments.length === 0 ? (
              <div className="text-muted-foreground px-2 py-1.5 text-xs">
                No courses yet.
              </div>
            ) : (
              enrollments.map((e) => (
                <Link
                  key={e.id}
                  href={`/courses/${e.slug}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden",
                    "hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
                    e.slug === activeSlug && "bg-accent/50",
                  )}
                >
                  <span className="flex-1 truncate">{e.title}</span>
                  {e.slug === activeSlug && (
                    <Check className="size-4 opacity-80" />
                  )}
                </Link>
              ))
            )}
            <Separator className="my-1" />
            <Link
              href="/enroll"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
            >
              <Plus className="size-4" />
              <span>Enroll in new course</span>
            </Link>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

