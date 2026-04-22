import { Suspense } from "react";
import Link from "next/link";
import { CircleAlert } from "lucide-react";
import { AuthStatusCard } from "@/components/auth/auth-status-card";
import { Button } from "@/components/ui/button";

type SearchParams = Promise<{ reason?: string }>;

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<Fallback />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}

async function Content({ searchParams }: { searchParams: SearchParams }) {
  const { reason } = await searchParams;

  return (
    <AuthStatusCard
      tone="error"
      icon={<CircleAlert />}
      title="Verification failed"
      description={
        <>
          We couldn&apos;t confirm your email.
          {reason && (
            <span className="text-foreground mt-2 block text-xs">
              {reason}
            </span>
          )}
        </>
      }
      footer={
        <>
          <Button asChild className="w-full">
            <Link href="/login">Back to login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/sign-up">Try signing up again</Link>
          </Button>
        </>
      }
    />
  );
}

function Fallback() {
  return (
    <AuthStatusCard
      tone="error"
      icon={<CircleAlert />}
      title="Verification failed"
      description="We couldn't confirm your email."
    />
  );
}
