"use client";

import { useState, useTransition } from "react";
import {
  disableAudioVersion,
  enableAudioVersion,
  setCurrentAudioVersion,
} from "@/lib/domains/courses/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Row shape comes straight from getAdminLessonBySlugs — keep in sync if the
// query ever changes.
export type AudioVersion = {
  id: string;
  label: string;
  audioPath: string;
  audioDurationSeconds: number | null;
  isCurrent: boolean;
  disabledAt: Date | null;
  createdAt: Date;
  signedUrl: string | null;
};

export function AudioVersionsTable({
  versions,
}: {
  versions: AudioVersion[];
}) {
  if (versions.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No audio versions yet. Add the first one above.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {versions.map((v) => (
        <AudioVersionRow key={v.id} version={v} />
      ))}
    </ul>
  );
}

function AudioVersionRow({ version }: { version: AudioVersion }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isDisabled = version.disabledAt !== null;

  function run(action: (input: { versionId: string }) => Promise<{
    ok: true;
    data: { versionId: string };
  } | { ok: false; error?: string; fieldErrors?: Record<string, string[]> }>) {
    setError(null);
    startTransition(async () => {
      const result = await action({ versionId: version.id });
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <li className="flex flex-col gap-3 rounded-md border px-4 py-3 text-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{version.label}</span>
            {version.isCurrent && <Badge>Current</Badge>}
            {isDisabled && <Badge variant="secondary">Disabled</Badge>}
          </div>
          <span className="text-muted-foreground text-xs">
            {formatDuration(version.audioDurationSeconds)} · Added{" "}
            {formatDate(version.createdAt)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!version.isCurrent && !isDisabled && (
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => run(setCurrentAudioVersion)}
            >
              Set as current
            </Button>
          )}
          {isDisabled ? (
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => run(enableAudioVersion)}
            >
              Enable
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              disabled={pending}
              onClick={() => run(disableAudioVersion)}
            >
              Disable
            </Button>
          )}
        </div>
      </div>
      {version.signedUrl ? (
        <audio controls src={version.signedUrl} className="w-full" />
      ) : (
        <p className="text-muted-foreground text-xs italic">
          Playback URL unavailable.
        </p>
      )}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </li>
  );
}

function formatDuration(seconds: number | null): string {
  if (seconds == null) return "— duration unknown";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(d: Date): string {
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
