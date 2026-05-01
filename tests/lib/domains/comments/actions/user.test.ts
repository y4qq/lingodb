import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

async function importCommentActions() {
  return import(
    new URL(
      `../../../../../lib/domains/comments/actions/user.ts?t=${Math.random()}`,
      import.meta.url,
    ).href
  );
}

test("submitCourseComment returns field errors before invoking the action runner", async () => {
  const { commentUserActionRuntime, submitCourseComment } =
    await importCommentActions();
  const defaultRunUserAction = commentUserActionRuntime.runUserAction;
  const runUserActionCalls: unknown[] = [];

  commentUserActionRuntime.runUserAction = async (
    opts: Parameters<typeof defaultRunUserAction>[0],
  ) => {
    runUserActionCalls.push(opts);
    return { ok: true, data: { id: "comment-1" } };
  };

  try {
    const formData = new FormData();
    formData.set("courseId", "123e4567-e89b-42d3-a456-426614174000");
    formData.set("body", "   ");

    const result = await submitCourseComment(undefined, formData);

    assert.deepEqual(result, {
      ok: false,
      fieldErrors: {
        body: ["Comment cannot be empty"],
      },
    });
    assert.equal(runUserActionCalls.length, 0);
  } finally {
    commentUserActionRuntime.runUserAction = defaultRunUserAction;
  }
});

test("submitCourseComment delegates valid input to runUserAction", async () => {
  const { commentUserActionRuntime, submitCourseComment } =
    await importCommentActions();
  const defaultRunUserAction = commentUserActionRuntime.runUserAction;
  const runUserActionCalls: Array<Record<string, unknown>> = [];

  commentUserActionRuntime.runUserAction = async (
    opts: Parameters<typeof defaultRunUserAction>[0],
  ) => {
    runUserActionCalls.push(opts as Record<string, unknown>);
    return { ok: true, data: { id: "comment-1" } };
  };

  try {
    const formData = new FormData();
    formData.set("courseId", "123e4567-e89b-42d3-a456-426614174000");
    formData.set("body", "Great lesson");

    const result = await submitCourseComment(undefined, formData);

    assert.deepEqual(result, { ok: true, data: { id: "comment-1" } });
    assert.equal(runUserActionCalls.length, 1);
    assert.equal(runUserActionCalls[0]?.actionName, "submitCourseComment");
    assert.deepEqual(runUserActionCalls[0]?.extra, {
      courseId: "123e4567-e89b-42d3-a456-426614174000",
    });
  } finally {
    commentUserActionRuntime.runUserAction = defaultRunUserAction;
  }
});

afterEach(() => {
  process.env.DATABASE_URL ??=
    "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
});
