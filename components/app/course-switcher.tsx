"use client";

import "react-flagpack-react-19/dist/style.css";
import Link from "next/link";
import Flag from "react-flagpack-react-19";
import { Check, ChevronRight, Plus } from "lucide-react";
import type { EnrollmentNavItem } from "@/components/app/app-sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { flagForLanguageCode } from "@/lib/domains/courses/language-flags";

type Props = {
  enrollments: EnrollmentNavItem[];
  activeSlug: string | null;
};

const triggerClass =
  "rounded-none border-b-2 border-border px-6 h-14 data-[state=open]:bg-sidebar-accent";

export function CourseSwitcher({ enrollments, activeSlug }: Props) {
  const { isMobile } = useSidebar();
  const active = enrollments.find((e) => e.slug === activeSlug);
  const activeFlag = active ? flagForLanguageCode(active.targetLanguageCode) : null;

  return (
    <SidebarMenu className="gap-0">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton tooltip="Courses" className={triggerClass}>
              <FlagTile flag={activeFlag} />
              <span className="flex-1 truncate text-left uppercase">Courses</span>
              <ChevronRight className="ml-auto size-4 opacity-60" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side={isMobile ? "bottom" : "right"}
            sideOffset={8}
            className="min-w-64 max-w-80"
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs font-medium">
              Your courses
            </DropdownMenuLabel>
            {enrollments.length === 0 ? (
              <div className="text-muted-foreground px-2 py-1.5 text-xs">
                No courses yet.
              </div>
            ) : (
              enrollments.map((e) => {
                const flag = flagForLanguageCode(e.targetLanguageCode);
                const isActive = e.slug === activeSlug;
                return (
                  <DropdownMenuItem key={e.id} asChild>
                    <Link href={`/courses/${e.slug}`} className="cursor-pointer">
                      <FlagTile flag={flag} />
                      <span className="flex-1 truncate">{e.title}</span>
                      {isActive && <Check className="size-4 opacity-80" />}
                    </Link>
                  </DropdownMenuItem>
                );
              })
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/enroll" className="cursor-pointer">
                <Plus className="size-4" />
                <span>Enroll in new course</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function FlagTile({ flag }: { flag: ReturnType<typeof flagForLanguageCode> }) {
  return (
    <span className="inline-flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-xs bg-muted">
      {flag ? <Flag code={flag} size="S" /> : null}
    </span>
  );
}
