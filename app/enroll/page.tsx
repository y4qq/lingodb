import { listAvailableCoursesForMe } from "@/lib/domains/courses/queries/public";
import {
  FloatingPanel,
  FloatingPanelBody,
  FloatingPanelDescription,
  FloatingPanelHeader,
  FloatingPanelLayout,
  FloatingPanelLayoutSide,
  FloatingPanelTitle,
} from "@/components/ui/floating-panel";
import { EnrollCatalog } from "./enroll-catalog";

export default async function EnrollPage() {
  const available = await listAvailableCoursesForMe();

  return (
    <FloatingPanelLayout>
      <FloatingPanel className="flex-1">
        <FloatingPanelHeader>
          <FloatingPanelTitle>Enroll in a course</FloatingPanelTitle>
          <FloatingPanelDescription>
            Pick a course to get started. You can always add more later.
          </FloatingPanelDescription>
        </FloatingPanelHeader>
        <FloatingPanelBody>
          <EnrollCatalog
            courses={available.map((c) => ({
              id: c.id,
              title: c.title,
              baseLanguage: {
                id: c.baseLanguage.id,
                name: c.baseLanguage.name,
              },
              targetLanguage: {
                code: c.targetLanguage.code,
                name: c.targetLanguage.name,
              },
            }))}
          />
        </FloatingPanelBody>
      </FloatingPanel>
      <FloatingPanelLayoutSide />
    </FloatingPanelLayout>
  );
}
