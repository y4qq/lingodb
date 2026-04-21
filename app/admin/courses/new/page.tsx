import { Suspense } from "react";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { languages } from "@/supabase/schema";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { NewCourseForm } from "./new-course-form";

export default function NewCoursePage() {
  return (
    <>
      <AdminPageHeader
        breadcrumbs={[
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/courses", label: "Courses" },
          { label: "New" },
        ]}
        title="New course"
        description="Creates the course as a draft. Publish it separately once its packs and lessons are ready."
      />
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <FormLoader />
      </Suspense>
    </>
  );
}

async function FormLoader() {
  const langs = await db.query.languages.findMany({
    orderBy: asc(languages.name),
  });
  return <NewCourseForm languages={langs} />;
}
