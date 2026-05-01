import assert from "node:assert/strict";
import { test } from "node:test";
import { NotFoundError } from "@/lib/errors";

process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

async function importLessonAccess() {
  return import(
    new URL(
      `../../../../lib/domains/courses/lesson-access.ts?t=${Math.random()}`,
      import.meta.url,
    ).href
  );
}

test("assertUserEnrolledForLesson throws when the lesson does not exist", async () => {
  const { assertUserEnrolledForLesson, lessonAccessRuntime } =
    await importLessonAccess();
  const defaultDb = lessonAccessRuntime.db;
  const defaultAnd = lessonAccessRuntime.and;
  const defaultEq = lessonAccessRuntime.eq;
  const lessonQueries: unknown[] = [];
  const enrollmentQueries: unknown[] = [];

  lessonAccessRuntime.and = (...clauses: unknown[]) => ({ clauses });
  lessonAccessRuntime.eq = (left: unknown, right: unknown) => ({
    left,
    right,
  });
  lessonAccessRuntime.db = {
    query: {
      lessons: {
        findFirst: async (query: unknown) => {
          lessonQueries.push(query);
          return null;
        },
      },
      userCourses: {
        findFirst: async (query: unknown) => {
          enrollmentQueries.push(query);
          return null;
        },
      },
    },
  } as typeof lessonAccessRuntime.db;

  try {
    await assert.rejects(
      assertUserEnrolledForLesson("user-1", "lesson-1"),
      (error: unknown) =>
        error instanceof NotFoundError && error.message === "Lesson not found",
    );

    assert.equal(lessonQueries.length, 1);
    assert.equal(enrollmentQueries.length, 0);
  } finally {
    lessonAccessRuntime.db = defaultDb;
    lessonAccessRuntime.and = defaultAnd;
    lessonAccessRuntime.eq = defaultEq;
  }
});

test("assertUserEnrolledForLesson throws when the user is not enrolled", async () => {
  const { assertUserEnrolledForLesson, lessonAccessRuntime } =
    await importLessonAccess();
  const defaultDb = lessonAccessRuntime.db;
  const defaultAnd = lessonAccessRuntime.and;
  const defaultEq = lessonAccessRuntime.eq;
  const lessonQueries: unknown[] = [];
  const enrollmentQueries: unknown[] = [];

  lessonAccessRuntime.and = (...clauses: unknown[]) => ({ clauses });
  lessonAccessRuntime.eq = (left: unknown, right: unknown) => ({
    left,
    right,
  });
  lessonAccessRuntime.db = {
    query: {
      lessons: {
        findFirst: async (query: unknown) => {
          lessonQueries.push(query);
          return { id: "lesson-1", unit: { courseId: "course-1" } };
        },
      },
      userCourses: {
        findFirst: async (query: unknown) => {
          enrollmentQueries.push(query);
          return null;
        },
      },
    },
  } as typeof lessonAccessRuntime.db;

  try {
    await assert.rejects(
      assertUserEnrolledForLesson("user-1", "lesson-1"),
      (error: unknown) =>
        error instanceof NotFoundError && error.message === "Lesson not found",
    );

    assert.equal(lessonQueries.length, 1);
    assert.equal(enrollmentQueries.length, 1);
  } finally {
    lessonAccessRuntime.db = defaultDb;
    lessonAccessRuntime.and = defaultAnd;
    lessonAccessRuntime.eq = defaultEq;
  }
});

test("assertUserEnrolledForLesson resolves when the user is enrolled", async () => {
  const { assertUserEnrolledForLesson, lessonAccessRuntime } =
    await importLessonAccess();
  const defaultDb = lessonAccessRuntime.db;
  const defaultAnd = lessonAccessRuntime.and;
  const defaultEq = lessonAccessRuntime.eq;
  const lessonQueries: unknown[] = [];
  const enrollmentQueries: unknown[] = [];

  lessonAccessRuntime.and = (...clauses: unknown[]) => ({ clauses });
  lessonAccessRuntime.eq = (left: unknown, right: unknown) => ({
    left,
    right,
  });
  lessonAccessRuntime.db = {
    query: {
      lessons: {
        findFirst: async (query: unknown) => {
          lessonQueries.push(query);
          return { id: "lesson-1", unit: { courseId: "course-1" } };
        },
      },
      userCourses: {
        findFirst: async (query: unknown) => {
          enrollmentQueries.push(query);
          return { courseId: "course-1" };
        },
      },
    },
  } as typeof lessonAccessRuntime.db;

  try {
    await assert.doesNotReject(
      assertUserEnrolledForLesson("user-1", "lesson-1"),
    );

    assert.equal(lessonQueries.length, 1);
    assert.equal(enrollmentQueries.length, 1);
  } finally {
    lessonAccessRuntime.db = defaultDb;
    lessonAccessRuntime.and = defaultAnd;
    lessonAccessRuntime.eq = defaultEq;
  }
});
