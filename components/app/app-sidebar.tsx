"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Plus } from "lucide-react";
import { UserMenu } from "@/components/auth/user-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
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
  addCourseTrigger: ReactNode;
};

export function AppSidebar({
  userEmail,
  userName,
  enrollments,
  addCourseTrigger,
}: Props) {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
          <span className="px-2 text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            Fluent Fast
          </span>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>My courses</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {enrollments.length === 0 ? (
                <SidebarMenuItem>
                  <div className="text-muted-foreground px-2 py-1 text-xs group-data-[collapsible=icon]:hidden">
                    No courses yet.
                  </div>
                </SidebarMenuItem>
              ) : (
                enrollments.map((e) => (
                  <SidebarMenuItem key={e.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(`/courses/${e.slug}`)}
                      tooltip={e.title}
                    >
                      <Link href={`/courses/${e.slug}`}>
                        <BookOpen />
                        <span>{e.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>{addCourseTrigger}</SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <UserMenu email={userEmail} name={userName} />
      </SidebarFooter>
    </Sidebar>
  );
}

export function AddCourseMenuButton({
  onClick,
}: {
  onClick?: () => void;
}) {
  return (
    <SidebarMenuButton tooltip="Add course" onClick={onClick}>
      <Plus />
      <span>Add course</span>
    </SidebarMenuButton>
  );
}
