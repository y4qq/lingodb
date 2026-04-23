"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Layers, RotateCcw } from "lucide-react";
import { UserMenu } from "@/components/auth/user-menu";
import { CourseSwitcher } from "@/components/app/course-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export type EnrollmentNavItem = {
  id: string;
  slug: string;
  title: string;
};

type Props = {
  userEmail: string;
  userName: string | null;
  enrollments: EnrollmentNavItem[];
};

const navButtonClass =
  "rounded-none border-b-2 border-border px-6 h-14 data-active:ring-0";

export function AppSidebar({ userEmail, userName, enrollments }: Props) {
  const pathname = usePathname();
  const slugMatch = pathname.match(/^\/courses\/([^/]+)/);
  const activeSlug = slugMatch?.[1] ?? enrollments[0]?.slug ?? null;

  return (
    <Sidebar variant="floating">
      <SidebarHeader className="h-[70px] flex-row items-center border-b-2 border-border py-0 gap-0">
        <span className="font-heading text-2xl font-extrabold tracking-tight text-chart-3">
          Fluent Fast
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0">
              <SidebarMenuItem>
                {activeSlug ? (
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(`/courses/${activeSlug}`)}
                    tooltip="Lessons"
                    className={navButtonClass}
                  >
                    <Link href={`/courses/${activeSlug}`}>
                      <BookOpen />
                      <span className="uppercase">Lessons</span>
                    </Link>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton
                    disabled
                    tooltip="Lessons"
                    className={navButtonClass}
                  >
                    <BookOpen />
                    <span className="uppercase">Lessons</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  disabled
                  tooltip="Flashcards"
                  className={navButtonClass}
                >
                  <Layers />
                  <span className="uppercase">Flashcards</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  disabled
                  tooltip="Review"
                  className={navButtonClass}
                >
                  <RotateCcw />
                  <span className="uppercase">Review</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t-2 border-border p-0 gap-0">
        <CourseSwitcher enrollments={enrollments} activeSlug={activeSlug} />
        <UserMenu email={userEmail} name={userName} />
      </SidebarFooter>
    </Sidebar>
  );
}
