"use server";

import {
  runUserAction,
  type ActionResult,
  zodErrorToFieldErrors,
} from "@/lib/auth/actions";
import { submitFeedbackSchema } from "../feedback.validation";
import * as feedbackService from "../feedback.service";

export async function submitLessonFeedback(input: {
  lessonId: string;
  rating: number;
  comment?: string;
}): Promise<ActionResult<{ lessonId: string }>> {
  const parsed = submitFeedbackSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: zodErrorToFieldErrors(parsed.error),
    };
  }
  return runUserAction({
    actionName: "submitLessonFeedback",
    extra: { lessonId: parsed.data.lessonId, rating: parsed.data.rating },
    execute: async (userId) => {
      await feedbackService.upsertLessonFeedback(userId, parsed.data);
      return { lessonId: parsed.data.lessonId };
    },
  });
}
