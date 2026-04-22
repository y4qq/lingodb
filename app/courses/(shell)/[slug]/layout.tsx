import { redirect } from "next/navigation";
import { requireUserWithProfile } from "@/lib/auth/guards";
import { setActiveCourseForMe } from "@/lib/domains/users/actions/user";
import { assertCanAccessMyCourse } from "@/lib/domains/users/queries/user";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function CourseSlugLayout({ children, params }: Props) {
  const { slug } = await params;
  const { profile } = await requireUserWithProfile();

  const access = await assertCanAccessMyCourse(slug);
  if (!access) {
    redirect("/enroll");
  }

  // Implicit switch: visiting a course makes it the active one.
  if (profile.activeCourseId !== access.courseId) {
    await setActiveCourseForMe(access.courseId);
  }

  return <>{children}</>;
}
