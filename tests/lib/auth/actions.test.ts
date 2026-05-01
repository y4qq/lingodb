import assert from "node:assert/strict";
import { test } from "node:test";
import { ValidationError } from "@/lib/errors";

process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

async function importAuthActions() {
  return import(
    new URL(`../../../lib/auth/actions.ts?t=${Math.random()}`, import.meta.url)
      .href
  );
}

test("runUserAction returns data and sets the Sentry user", async () => {
  const { runUserAction, userActionRuntime } = await importAuthActions();
  const sentryUsers: unknown[] = [];
  const requireUserCalls: unknown[] = [];

  function fakeUser(email: string | null) {
    return {
      id: "user-1",
      email,
    } as Awaited<ReturnType<typeof userActionRuntime.requireUser>>;
  }

  userActionRuntime.requireUser = async () => {
    requireUserCalls.push(true);
    return fakeUser("user@example.com");
  };
  userActionRuntime.setSentryUser = (user: unknown) => {
    sentryUsers.push(user);
  };
  userActionRuntime.captureException = () => {
    throw new Error("captureException should not run on success");
  };

  const result = await runUserAction({
    actionName: "testSuccess",
    execute: async (userId: string) => ({ userId }),
  });

  assert.deepEqual(result, { ok: true, data: { userId: "user-1" } });
  assert.equal(requireUserCalls.length, 1);
  assert.deepEqual(sentryUsers, [{ id: "user-1", email: "user@example.com" }]);
});

test("runUserAction translates domain errors into user-facing results", async () => {
  const { runUserAction, userActionRuntime } = await importAuthActions();
  const captured: unknown[] = [];

  userActionRuntime.requireUser = async () =>
    ({
      id: "user-1",
      email: null,
    }) as unknown as Awaited<ReturnType<typeof userActionRuntime.requireUser>>;
  userActionRuntime.setSentryUser = () => {};
  userActionRuntime.captureException = (...args: unknown[]) => {
    captured.push(args);
    return "ignored";
  };

  const result = await runUserAction({
    actionName: "testValidationError",
    execute: async () => {
      throw new ValidationError("Bad input");
    },
  });

  assert.deepEqual(result, { ok: false, error: "Bad input" });
  assert.equal(captured.length, 0);
});

test("runUserAction captures unexpected errors and returns the generic message", async () => {
  const { runUserAction, userActionRuntime } = await importAuthActions();
  const captured: Array<{ err: unknown; context: unknown }> = [];

  userActionRuntime.requireUser = async () =>
    ({
      id: "user-1",
      email: "user@example.com",
    }) as unknown as Awaited<ReturnType<typeof userActionRuntime.requireUser>>;
  userActionRuntime.setSentryUser = () => {};
  userActionRuntime.captureException = (
    err: unknown,
    context: unknown,
  ) => {
    captured.push({ err, context });
    return "ignored";
  };

  const boom = new Error("boom");
  const result = await runUserAction({
    actionName: "testUnexpectedError",
    extra: { courseId: "course-1" },
    execute: async () => {
      throw boom;
    },
  });

  assert.deepEqual(result, {
    ok: false,
    error: "Something went wrong. Please try again.",
  });
  assert.equal(captured.length, 1);
  assert.equal(captured[0]?.err, boom);
  assert.deepEqual(captured[0]?.context, {
    extra: { action: "testUnexpectedError", courseId: "course-1" },
  });
});

test("runUserTask rethrows unexpected errors after capturing them", async () => {
  const { runUserTask, userActionRuntime } = await importAuthActions();
  const captured: Array<{ err: unknown; context: unknown }> = [];

  userActionRuntime.requireUser = async () =>
    ({
      id: "user-1",
      email: "user@example.com",
    }) as unknown as Awaited<ReturnType<typeof userActionRuntime.requireUser>>;
  userActionRuntime.setSentryUser = () => {};
  userActionRuntime.captureException = (
    err: unknown,
    context: unknown,
  ) => {
    captured.push({ err, context });
    return "ignored";
  };

  const boom = new Error("task failed");

  await assert.rejects(
    runUserTask({
      actionName: "testTaskFailure",
      extra: { lessonId: "lesson-1" },
      execute: async () => {
        throw boom;
      },
    }),
    boom,
  );

  assert.equal(captured.length, 1);
  assert.deepEqual(captured[0]?.context, {
    extra: { action: "testTaskFailure", lessonId: "lesson-1" },
  });
});
