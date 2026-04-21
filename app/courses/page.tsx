import { redirect } from "next/navigation";
import { setActiveCourseForMe } from "@/lib/domains/users/actions/user";
import { getMyLandingDecision } from "@/lib/domains/users/queries/user";

export default async function CoursesHubPage() {
  const decision = await getMyLandingDecision();
  if (decision.kind === "active") {
    redirect(`/courses/${decision.slug}`);
  }
  if (decision.kind === "adoptFirst") {
    await setActiveCourseForMe(decision.courseId);
    redirect(`/courses/${decision.slug}`);
  }
  redirect("/welcome");
}
