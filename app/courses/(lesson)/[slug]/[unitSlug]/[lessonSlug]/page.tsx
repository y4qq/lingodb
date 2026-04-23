import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string; unitSlug: string; lessonSlug: string }>;
};

export default async function LessonPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/courses/${slug}`);
}
