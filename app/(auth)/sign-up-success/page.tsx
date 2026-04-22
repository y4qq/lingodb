import { Suspense } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthStatusCard } from "@/components/auth/auth-status-card";
import { Button } from "@/components/ui/button";

type SearchParams = Promise<{ email?: string }>;

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<Fallback />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}

async function Content({ searchParams }: { searchParams: SearchParams }) {
  const { email } = await searchParams;

  return (
    <AuthStatusCard
      icon={<MailCheck />}
      title="Check your email"
      description={
        <>
          We&apos;ve sent a confirmation link to{" "}
          {email ? (
            <span className="text-foreground font-medium">{email}</span>
          ) : (
            "your inbox"
          )}
          . Click it to activate your account and get started.
        </>
      }
      footer={
        <>
          <p className="text-muted-foreground text-center text-xs">
            Didn&apos;t get it? Check your spam folder, then try signing up
            again.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Back to login</Link>
          </Button>
        </>
      }
    />
  );
}

function Fallback() {
  return (
    <AuthStatusCard
      icon={<MailCheck />}
      title="Check your email"
      description="We've sent a confirmation link to your inbox."
    />
  );
}
