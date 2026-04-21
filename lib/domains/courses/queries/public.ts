import "server-only";

// Anonymous-safe reads. Every function here filters `isPublished = true` at
// every ancestor level inside the service, so no auth guard is needed —
// drafts are never returned.
//
// Consumed by app/courses/**.

export {
  getPublishedCourseBySlug,
  getPublishedPackBySlugs,
  listPublishedCourses,
} from "../service";
