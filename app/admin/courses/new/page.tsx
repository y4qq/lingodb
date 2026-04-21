import { Suspense } from "react";
import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { languages } from "@/supabase/schema";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { NewCourseForm } from "./new-course-form";

export default function NewCoursePage() {
  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin">Admin</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/admin/courses">Courses</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">New course</h1>
        <p className="text-muted-foreground text-sm">
          Creates the course as a draft. Publish it separately once its
          packs and lessons are ready.
        </p>
      </header>

      <Suspense fallback={<FormFallback />}>
        <FormLoader />
      </Suspense>
    </div>
  );
}

async function FormLoader() {
  const langs = await db.query.languages.findMany({
    orderBy: asc(languages.name),
  });
  return <NewCourseForm languages={langs} />;
}

function FormFallback() {
  return <div className="bg-muted/30 h-96 animate-pulse rounded-xl" />;
}
