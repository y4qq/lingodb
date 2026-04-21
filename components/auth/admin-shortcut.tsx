import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProfileIfAdmin } from "@/lib/auth/guards";

export async function AdminShortcut() {
  const profile = await getProfileIfAdmin();
  if (!profile) return null;

  return (
    <Button asChild variant="outline" size="sm">
      <Link href="/admin">
        <Shield />
        Admin
      </Link>
    </Button>
  );
}
