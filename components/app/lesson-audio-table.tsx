"use client";

import { useAudioPlayer } from "@/components/audio-player";
import { DataTable, type Column } from "@/components/common/data-table";
import { Badge } from "@/components/ui/badge";

export type LessonAudioVersion = {
  id: string;
  label: string;
  audioDurationSeconds: number | null;
  isCurrent: boolean;
  createdAt: Date;
  signedUrl: string | null;
};

export function LessonAudioTable({
  versions,
}: {
  versions: LessonAudioVersion[];
}) {
  const { play, track } = useAudioPlayer();

  const columns: Column<LessonAudioVersion>[] = [
    {
      header: "Label",
      cell: (v) => (
        <span className="flex items-center gap-2">
          <span className="font-medium">{v.label}</span>
          {v.isCurrent && <Badge variant="secondary">Current</Badge>}
        </span>
      ),
    },
    {
      header: "Duration",
      cell: (v) => (
        <span className="text-muted-foreground font-mono text-xs tabular-nums">
          {formatDuration(v.audioDurationSeconds)}
        </span>
      ),
    },
    {
      header: "Added",
      cell: (v) => (
        <span className="text-muted-foreground">{formatDate(v.createdAt)}</span>
      ),
    },
    {
      header: "Status",
      className: "w-36",
      cell: (v) => {
        if (!v.signedUrl) {
          return (
            <span className="text-muted-foreground text-xs">
              Playback unavailable
            </span>
          );
        }
        if (track?.id === v.id) {
          return <Badge variant="outline">Playing</Badge>;
        }
        return null;
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={versions}
      rowKey={(v) => v.id}
      onRowClick={(v) => {
        if (!v.signedUrl) return;
        play({
          id: v.id,
          label: v.label,
          src: v.signedUrl,
          durationSeconds: v.audioDurationSeconds,
        });
      }}
      empty="No audio for this lesson yet."
    />
  );
}

function formatDuration(seconds: number | null): string {
  if (seconds == null) return "—";
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
