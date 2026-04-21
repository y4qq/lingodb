export const AUDIO_BUCKET = "lesson-audio";

// MIME types accepted for lesson audio uploads. Kept in sync with
// supabase/config.toml's `storage.buckets.lesson-audio.allowed_mime_types`.
export const ALLOWED_AUDIO_CONTENT_TYPES = [
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
] as const;

export type AllowedAudioContentType =
  (typeof ALLOWED_AUDIO_CONTENT_TYPES)[number];

const AUDIO_CONTENT_TYPE_EXTENSIONS: Record<AllowedAudioContentType, string> = {
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/wav": "wav",
  "audio/ogg": "ogg",
  "audio/webm": "webm",
};

export function contentTypeToExtension(
  contentType: AllowedAudioContentType,
): string {
  return AUDIO_CONTENT_TYPE_EXTENSIONS[contentType];
}
