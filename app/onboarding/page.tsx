import { OnboardingFlow } from "@/components/app/onboarding-flow";
import { requireUserWithProfile } from "@/lib/auth/guards";

export default async function OnboardingPage() {
  const { profile } = await requireUserWithProfile();
  return <OnboardingFlow initialDisplayName={profile.displayName} />;
}
