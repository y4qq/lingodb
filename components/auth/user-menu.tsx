"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftFromLine,
  ChevronRight,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { letterColor } from "@/lib/letter-color";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

type Props = {
  email: string;
  name: string | null;
  isAdmin?: boolean;
  adminContext?: boolean;
};

const triggerClass =
  "rounded-none px-6 h-14 data-[state=open]:bg-sidebar-accent";

export function UserMenu({
  email,
  name,
  isAdmin = false,
  adminContext = false,
}: Props) {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const initials = getInitials(name ?? email);
  const displayName = name?.trim() || email.split("@")[0];
  const firstName = displayName.split(/\s+/)[0];
  const color = letterColor(displayName);
  const avatarStyle = {
    backgroundColor: color.background,
    color: color.foreground,
  };

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <SidebarMenu className="gap-0">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton tooltip={displayName} className={triggerClass}>
              <Avatar size="sm">
                <AvatarFallback style={avatarStyle}>{initials}</AvatarFallback>
              </Avatar>
              <span className="flex-1 truncate text-left uppercase">
                {firstName}
              </span>
              <ChevronRight className="ml-auto size-4 opacity-60" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
            className="min-w-56"
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col">
                <span className="truncate text-sm font-medium">
                  {displayName}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {adminContext ? (
              <DropdownMenuItem asChild>
                <Link href="/courses" className="cursor-pointer">
                  <ArrowLeftFromLine />
                  Exit admin
                </Link>
              </DropdownMenuItem>
            ) : isAdmin ? (
              <DropdownMenuItem asChild>
                <Link href="/admin" className="cursor-pointer">
                  <LayoutDashboard />
                  Admin dashboard
                </Link>
              </DropdownMenuItem>
            ) : null}
            {(adminContext || isAdmin) && <DropdownMenuSeparator />}
            <DropdownMenuItem onClick={logout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function getInitials(source: string): string {
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "A";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}
