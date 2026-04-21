"use client";

import { useState, useTransition } from "react";
import {
  prepareAudioUpload,
  registerAudioVersion,
} from "@/lib/domains/courses/actions/admin";
import {
  ALLOWED_AUDIO_CONTENT_TYPES,
  AUDIO_BUCKET,
} from "@/lib/domains/courses/audio.shared";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AllowedContentType = (typeof ALLOWED_AUDIO_CONTENT_TYPES)[number];

function isAllowedContentType(value: string): value is AllowedContentType {
  return (ALLOWED_AUDIO_CONTENT_TYPES as readonly string[]).includes(value);
}

export function AudioVersionUploader({ lessonId }: { lessonId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [label, setLabel] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function reset() {
    setLabel("");
    setFile(null);
    setError(null);
    setFieldErrors({});
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!file) {
      setError("Pick an audio file to upload.");
      return;
    }
    if (!isAllowedContentType(file.type)) {
      setError(
        `Unsupported file type "${file.type}". Use mp3, m4a, wav, ogg, or webm.`,
      );
      return;
    }
    const contentType: AllowedContentType = file.type;

    startTransition(async () => {
      // 1. Measure duration client-side. Swallow errors — it's optional
      //    metadata, not load-bearing for playback.
      const duration = await tryMeasureDuration(file);

      // 2. Mint a signed upload URL for a new path under this lesson.
      const prep = await prepareAudioUpload({
        lessonId,
        filename: file.name,
        contentType,
      });
      if (!prep.ok) {
        setFieldErrors(prep.fieldErrors ?? {});
        setError(prep.error ?? firstFieldError(prep.fieldErrors) ?? null);
        return;
      }

      // 3. PUT the file straight to Storage.
      const supabase = createClient();
      const upload = await supabase.storage
        .from(AUDIO_BUCKET)
        .uploadToSignedUrl(prep.data.path, prep.data.token, file, {
          contentType,
          upsert: false,
        });
      if (upload.error) {
        setError(`Upload failed: ${upload.error.message}`);
        return;
      }

      // 4. Register the metadata row.
      const register = await registerAudioVersion({
        lessonId,
        label: label.trim(),
        audioPath: prep.data.path,
        audioDurationSeconds: duration,
      });
      if (!register.ok) {
        setFieldErrors(register.fieldErrors ?? {});
        setError(register.error ?? firstFieldError(register.fieldErrors) ?? null);
        return;
      }

      // 5. Close + reset. revalidatePath in the action refreshes the list.
      setOpen(false);
      reset();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) {
          setOpen(next);
          if (!next) reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>Add new version</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add audio version</DialogTitle>
          <DialogDescription>
            Upload an audio file and give this version a short label.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              name="label"
              required
              maxLength={80}
              placeholder="v2 – native speaker"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={pending}
            />
            {fieldErrors.label?.[0] && (
              <p className="text-destructive text-xs">
                {fieldErrors.label[0]}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="file">Audio file</Label>
            <Input
              id="file"
              name="file"
              type="file"
              required
              accept={ALLOWED_AUDIO_CONTENT_TYPES.join(",")}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              disabled={pending}
            />
            <p className="text-muted-foreground text-xs">
              mp3, m4a, wav, ogg, or webm. Max 50 MB.
            </p>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Uploading…" : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Loads the file into an <audio> element to read its duration. Returns
// undefined if the browser can't decode the metadata, errors, or takes too
// long — the version still gets created, just without a duration.
const DURATION_TIMEOUT_MS = 8000;

async function tryMeasureDuration(file: File): Promise<number | undefined> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    audio.src = url;
    let settled = false;
    const finish = (seconds: number | undefined) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      resolve(seconds);
    };
    const timer = setTimeout(() => finish(undefined), DURATION_TIMEOUT_MS);
    audio.onloadedmetadata = () => {
      finish(
        Number.isFinite(audio.duration) ? Math.round(audio.duration) : undefined,
      );
    };
    audio.onerror = () => finish(undefined);
  });
}

function firstFieldError(
  fieldErrors: Record<string, string[]> | undefined,
): string | undefined {
  if (!fieldErrors) return undefined;
  for (const errs of Object.values(fieldErrors)) {
    if (errs && errs.length > 0) return errs[0];
  }
  return undefined;
}
