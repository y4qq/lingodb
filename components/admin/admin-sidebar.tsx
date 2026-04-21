"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftFromLine, BookOpen, LayoutDashboard } from "lucide-react";
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserMenu } from "@/components/auth/user-menu";

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
];

type Props = {
  userEmail: string;
  userName: string | null;
};

export function AdminSidebar({ userEmail, userName }: Props) {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
          <span className="px-2 text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
            Admin
          </span>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.matches(pathname)}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Exit admin">
              <Link href="/courses">
                <ArrowLeftFromLine />
                <span>Exit admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <UserMenu email={userEmail} name={userName} />
      </SidebarFooter>
    </Sidebar>
  );
}
