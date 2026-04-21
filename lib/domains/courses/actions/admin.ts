"use server";

import * as Sentry from "@sentry/nextjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { createAdminClient } from "@/lib/supabase/admin";
import { AUDIO_BUCKET, contentTypeToExtension } from "../audio.shared";
import * as audioVersions from "../audio.service";
import {
  prepareAudioUploadSchema,
  registerAudioVersionSchema,
  versionIdSchema,
} from "../audio.validation";
import * as courses from "../course.service";
import { createCourseSchema, updateCourseSchema } from "../course.validation";
import { createLessonSchema } from "../lesson.validation";
import { createPackSchema, updatePackSchema } from "../pack.validation";

const ADMIN_COURSES_ROUTE = "/admin/courses";
const ADMIN_LESSON_ROUTE = "/admin/courses/[slug]/[packSlug]/[lessonSlug]";
const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error?: string; fieldErrors?: Record<string, string[]> };

export async function createCourse(
  _prev: ActionResult<{ slug: string }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ slug: string }>> {
  const parsed = createCourseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors(parsed.error) };
  }

  return runAdminAction({
    actionName: "createCourse",
    execute: async () => {
      const course = await courses.createCourse(parsed.data);
      return { slug: course.slug };
    },
    onSuccess: () => revalidatePath(ADMIN_COURSES_ROUTE),
    extra: { input: parsed.data },
  });
}

export async function updateCourse(
  _prev: ActionResult<{ slug: string }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ slug: string }>> {
  const parsed = updateCourseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors(parsed.error) };
  }

  return runAdminAction({
    actionName: "updateCourse",
    execute: async () => {
      const { id, ...updates } = parsed.data;
      const course = await courses.updateCourse(id, updates);
      return { slug: course.slug };
    },
    onSuccess: (data) => {
      revalidatePath(ADMIN_COURSES_ROUTE);
      revalidatePath(`/admin/courses/${data.slug}`);
    },
    extra: { input: parsed.data },
  });
}

export async function createPack(
  _prev: ActionResult<{ id: string; slug: string }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const parsed = createPackSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors(parsed.error) };
  }

  return runAdminAction({
    actionName: "createPack",
    execute: async () => {
      const pack = await courses.createPack(parsed.data);
      return { id: pack.id, slug: pack.slug };
    },
    onSuccess: () => revalidatePath("/admin", "layout"),
    extra: { input: parsed.data },
  });
}

export async function createLesson(
  _prev: ActionResult<{ id: string; slug: string }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const parsed = createLessonSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors(parsed.error) };
  }

  return runAdminAction({
    actionName: "createLesson",
    execute: async () => {
      const lesson = await courses.createLesson(parsed.data);
      return { id: lesson.id, slug: lesson.slug };
    },
    onSuccess: () => revalidatePath("/admin", "layout"),
    extra: { input: parsed.data },
  });
}

export async function updatePack(
  _prev: ActionResult<{ id: string }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const parsed = updatePackSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors(parsed.error) };
  }

  return runAdminAction({
    actionName: "updatePack",
    execute: async () => {
      const { id, ...updates } = parsed.data;
      const pack = await courses.updatePack(id, updates);
      return { id: pack.id };
    },
    // Broad revalidate: pack paths depend on the parent course slug, which we
    // don't have without another lookup. All admin pages re-fetch on next nav.
    onSuccess: () => revalidatePath("/admin", "layout"),
    extra: { input: parsed.data },
  });
}

// Mints a signed URL so the browser can PUT the file straight to Supabase
// Storage, avoiding Next's body-size limits. Metadata is written separately
// by `registerAudioVersion` once the upload completes.
export async function prepareAudioUpload(
  input: unknown,
): Promise<ActionResult<{ path: string; token: string; signedUrl: string }>> {
  const parsed = prepareAudioUploadSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors(parsed.error) };
  }

  const { lessonId, filename, contentType } = parsed.data;
  return runAdminAction({
    actionName: "prepareAudioUpload",
    genericMessage: "Could not start upload. Please try again.",
    extra: { lessonId, filename, contentType },
    execute: async () => {
      const ext = contentTypeToExtension(contentType);
      const path = `${lessonId}/${crypto.randomUUID()}.${ext}`;

      const admin = createAdminClient();
      const { data, error } = await admin.storage
        .from(AUDIO_BUCKET)
        .createSignedUploadUrl(path, { upsert: false });
      if (error || !data) {
        throw error ?? new Error("createSignedUploadUrl returned no data");
      }

      return { path, token: data.token, signedUrl: data.signedUrl };
    },
  });
}

export async function registerAudioVersion(
  input: unknown,
): Promise<ActionResult<{ versionId: string }>> {
  const parsed = registerAudioVersionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors(parsed.error) };
  }

  return runAdminAction({
    actionName: "registerAudioVersion",
    execute: async () => {
      const row = await audioVersions.insertAudioVersion(parsed.data);
      return { versionId: row.id };
    },
    onSuccess: () => revalidatePath(ADMIN_LESSON_ROUTE, "page"),
    extra: { input: parsed.data },
  });
}

export async function setCurrentAudioVersion(
  input: unknown,
): Promise<ActionResult<{ versionId: string }>> {
  const parsed = versionIdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors(parsed.error) };
  }

  return runAdminAction({
    actionName: "setCurrentAudioVersion",
    execute: async () => {
      const row = await audioVersions.setCurrentAudioVersion(
        parsed.data.versionId,
      );
      return { versionId: row.id };
    },
    onSuccess: () => revalidatePath(ADMIN_LESSON_ROUTE, "page"),
    extra: { input: parsed.data },
  });
}

export async function disableAudioVersion(
  input: unknown,
): Promise<ActionResult<{ versionId: string }>> {
  const parsed = versionIdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors(parsed.error) };
  }

  return runAdminAction({
    actionName: "disableAudioVersion",
    execute: async () => {
      const row = await audioVersions.disableAudioVersion(
        parsed.data.versionId,
      );
      return { versionId: row.id };
    },
    onSuccess: () => revalidatePath(ADMIN_LESSON_ROUTE, "page"),
    extra: { input: parsed.data },
  });
}

export async function enableAudioVersion(
  input: unknown,
): Promise<ActionResult<{ versionId: string }>> {
  const parsed = versionIdSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors(parsed.error) };
  }

  return runAdminAction({
    actionName: "enableAudioVersion",
    execute: async () => {
      const row = await audioVersions.enableAudioVersion(
        parsed.data.versionId,
      );
      return { versionId: row.id };
    },
    onSuccess: () => revalidatePath(ADMIN_LESSON_ROUTE, "page"),
    extra: { input: parsed.data },
  });
}

type DomainError = ConflictError | NotFoundError | ValidationError;

async function runAdminAction<T>({
  actionName,
  execute,
  onSuccess,
  genericMessage = GENERIC_ERROR_MESSAGE,
  extra = {},
}: {
  actionName: string;
  execute: () => Promise<T>;
  onSuccess?: (data: T) => void | Promise<void>;
  genericMessage?: string;
  extra?: Record<string, unknown>;
}): Promise<ActionResult<T>> {
  await guardAdmin();

  try {
    const data = await execute();
    await onSuccess?.(data);
    return { ok: true, data };
  } catch (err) {
    // Next's redirect()/notFound() throw tagged errors that must propagate
    // for the framework to perform the navigation — never swallow them.
    if (isNextControlFlowError(err)) throw err;

    if (isDomainError(err)) {
      return { ok: false, error: err.message };
    }

    Sentry.captureException(err, {
      extra: { action: actionName, ...extra },
    });
    return { ok: false, error: genericMessage };
  }
}

async function guardAdmin() {
  const { user } = await requireAdmin();
  Sentry.setUser({ id: user.id, email: user.email ?? undefined });
}

function isDomainError(err: unknown): err is DomainError {
  return (
    err instanceof ConflictError ||
    err instanceof NotFoundError ||
    err instanceof ValidationError
  );
}

function isNextControlFlowError(err: unknown): boolean {
  if (err === null || typeof err !== "object") return false;
  const digest = (err as { digest?: unknown }).digest;
  return (
    typeof digest === "string" &&
    (digest.startsWith("NEXT_REDIRECT") || digest === "NEXT_NOT_FOUND")
  );
}

function toFieldErrors(error: z.ZodError): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).filter(
      (entry): entry is [string, string[]] => entry[1] !== undefined,
    ),
  );
}
