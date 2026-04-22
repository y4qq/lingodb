import { redirect } from "next/navigation";
import { requireUserWithProfile } from "@/lib/auth/guards";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireUserWithProfile();
  if (profile.onboardedAt) {
    redirect("/courses");
  }
  return <>{children}</>;
}
