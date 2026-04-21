"use client";

import { useRouter } from "next/navigation";
import { ChevronsUpDown, LogOut } from "lucide-react";
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
};

export function UserMenu({ email, name }: Props) {
  const router = useRouter();
  const { isMobile } = useSidebar();
  const initials = getInitials(name ?? email);
  const displayName = name?.trim() || email.split("@")[0];

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={displayName}
              className="data-[state=open]:bg-sidebar-accent"
            >
              <Avatar size="sm">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 opacity-60" />
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
