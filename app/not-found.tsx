import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-5">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-muted-foreground text-sm font-medium">404</span>
        <h1 className="text-2xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="text-muted-foreground text-sm">
          The page you&rsquo;re looking for doesn&rsquo;t exist or isn&rsquo;t
          available.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
