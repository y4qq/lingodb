import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminHome() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="text-muted-foreground text-sm">
          Content management for courses, packs, and lessons.
        </p>
      </header>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/admin/courses">Manage courses</Link>
        </Button>
      </div>
    </div>
  );
}
