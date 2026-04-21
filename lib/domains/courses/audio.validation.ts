import { z } from "zod";
import { ALLOWED_AUDIO_CONTENT_TYPES } from "./audio.shared";

export const prepareAudioUploadSchema = z.object({
  lessonId: z.uuid("Invalid lesson"),
  filename: z
    .string()
    .min(1, "Filename is required")
    .max(255, "Filename must be 255 characters or fewer"),
  contentType: z.enum(ALLOWED_AUDIO_CONTENT_TYPES, {
    error: "Unsupported audio format",
  }),
});
export type PrepareAudioUploadInput = z.infer<typeof prepareAudioUploadSchema>;

export const registerAudioVersionSchema = z.object({
  lessonId: z.uuid("Invalid lesson"),
  label: z
    .string()
    .min(1, "Label is required")
    .max(80, "Label must be 80 characters or fewer"),
  audioPath: z
    .string()
    .min(1, "Audio path is required")
    .max(512, "Audio path is too long"),
  audioDurationSeconds: z.coerce
    .number()
    .int("Duration must be an integer number of seconds")
    .positive("Duration must be positive")
    .optional(),
});
export type RegisterAudioVersionInput = z.infer<
  typeof registerAudioVersionSchema
>;

export const versionIdSchema = z.object({
  versionId: z.uuid("Invalid version"),
});
export type VersionIdInput = z.infer<typeof versionIdSchema>;
