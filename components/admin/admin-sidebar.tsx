"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, MessageSquare, Star } from "lucide-react";
import { UserMenu } from "@/components/auth/user-menu";
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

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
  matches: (pathname: string) => boolean;
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard />,
    matches: (p) => p === "/admin",
  },
  {
    label: "Courses",
    href: "/admin/courses",
    icon: <BookOpen />,
    matches: (p) => p === "/admin/courses" || p.startsWith("/admin/courses/"),
  },
  {
    label: "Comments",
    href: "/admin/comments",
    icon: <MessageSquare />,
    matches: (p) => p === "/admin/comments" || p.startsWith("/admin/comments/"),
  },
  {
    label: "Feedback",
    href: "/admin/feedback",
    icon: <Star />,
    matches: (p) => p === "/admin/feedback" || p.startsWith("/admin/feedback/"),
  },
];

type Props = {
  userEmail: string;
  userName: string | null;
};

const navButtonClass =
  "rounded-none border-b-2 border-border px-6 h-14 data-active:ring-0";

export function AdminSidebar({ userEmail, userName }: Props) {
  const pathname = usePathname();

  return (
    <Sidebar variant="floating">
      <SidebarHeader className="h-[70px] flex-row items-center border-b-2 border-border py-0 gap-0">
        <span className="font-heading text-2xl font-extrabold tracking-tight text-chart-3">
          Admin
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.matches(pathname)}
                    tooltip={item.label}
                    className={navButtonClass}
                  >
                    <Link href={item.href}>
                      {item.icon}
                      <span className="uppercase">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t-2 border-border p-0">
        <UserMenu email={userEmail} name={userName} adminContext />
      </SidebarFooter>
    </Sidebar>
  );
}
