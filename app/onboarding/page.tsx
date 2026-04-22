import { OnboardingFlow } from "@/components/app/onboarding-flow";
import { requireUserWithProfile } from "@/lib/auth/guards";
import { listAvailableCoursesForMe } from "@/lib/domains/courses/queries/public";

export default async function OnboardingPage() {
  const { profile } = await requireUserWithProfile();
  const courses = await listAvailableCoursesForMe();

  return (
    <OnboardingFlow
      initialDisplayName={profile.displayName}
      courses={courses.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        baseLanguage: { name: c.baseLanguage.name },
        targetLanguage: { name: c.targetLanguage.name },
      }))}
    />
  );
}
