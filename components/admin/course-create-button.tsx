import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { languages } from "@/supabase/schema";
import { CourseCreateDialog } from "./course-create-dialog";

export async function CourseCreateButton() {
  const langs = await db.query.languages.findMany({
    orderBy: asc(languages.name),
  });
  return <CourseCreateDialog languages={langs} />;
}
