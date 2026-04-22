import { Suspense } from "react";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { AuthStatusCard } from "@/components/auth/auth-status-card";
import { Button } from "@/components/ui/button";

type SearchParams = Promise<{ next?: string }>;

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<Fallback />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}

async function Content({ searchParams }: { searchParams: SearchParams }) {
  const { next } = await searchParams;
  const continueHref = sanitiseNext(next);

  return (
    <AuthStatusCard
      tone="success"
      icon={<CircleCheck />}
      title="Email confirmed"
      description="Your account is ready. Let's pick up where you left off."
      footer={
        <Button asChild className="w-full">
          <Link href={continueHref}>Continue</Link>
        </Button>
      }
    />
  );
}

function Fallback() {
  return (
    <AuthStatusCard
      tone="success"
      icon={<CircleCheck />}
      title="Email confirmed"
      description="Your account is ready."
    />
  );
}

// Only allow same-origin redirects, so a tampered `next` param can't send
// users off to another site.
function sanitiseNext(next: string | undefined) {
  if (!next) return "/courses";
  if (!next.startsWith("/") || next.startsWith("//")) return "/courses";
  return next;
}
