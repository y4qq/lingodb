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

export function AppSidebar({ userEmail, userName, enrollments }: Props) {
  const pathname = usePathname();
  const slugMatch = pathname.match(/^\/courses\/([^/]+)/);
  const activeSlug = slugMatch?.[1] ?? enrollments[0]?.slug ?? null;

  return (
    <Sidebar >
      <SidebarHeader>
        <div className="flex items-center">
          <span className="p-2 text-lg font-extrabold text-chart-3 tracking-tight ">
            Fluent Fast
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                {activeSlug ? (
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(`/courses/${activeSlug}`)}
                    tooltip="Lessons"
                  >
                    <Link href={`/courses/${activeSlug}`}>
                      <BookOpen />
                      <span>Lessons</span>
                    </Link>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton disabled tooltip="Lessons">
                    <BookOpen />
                    <span>Lessons</span>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton disabled tooltip="Flashcards">
                  <Layers />
                  <span>Flashcards</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton disabled tooltip="Review">
                  <RotateCcw />
                  <span>Review</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <CourseSwitcher enrollments={enrollments} activeSlug={activeSlug} />
        <UserMenu email={userEmail} name={userName} />
      </SidebarFooter>
    </Sidebar>
  );
}
