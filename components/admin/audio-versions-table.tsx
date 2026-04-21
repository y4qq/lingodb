"use client";

import { useAudioPlayer } from "@/components/audio-player";
import { useAudioSelection } from "@/components/admin/audio-selection-provider";
import { DataTable, type Column } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

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
  const { play, track } = useAudioPlayer();
  const { selectedId, setSelectedId } = useAudioSelection();

  const columns: Column<AudioVersion>[] = [
    {
      header: "",
      className: "w-10",
      cell: (v) => (
        <Checkbox
          checked={selectedId === v.id}
          onCheckedChange={(checked) =>
            setSelectedId(checked ? v.id : null)
          }
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${v.label}`}
        />
      ),
    },
    {
      header: "Label",
      cell: (v) => <span className="font-medium">{v.label}</span>,
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
      className: "w-44",
      cell: (v) => (
        <div className="flex items-center gap-1.5">
          {v.isCurrent && <Badge>Current</Badge>}
          {v.disabledAt !== null && <Badge variant="secondary">Disabled</Badge>}
          {track?.id === v.id && (
            <Badge variant="outline">Playing</Badge>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={versions}
      rowKey={(v) => v.id}
      rowIsSelected={(v) => selectedId === v.id}
      onRowClick={(v) => {
        if (!v.signedUrl) return;
        play({
          id: v.id,
          label: v.label,
          src: v.signedUrl,
          durationSeconds: v.audioDurationSeconds,
        });
      }}
      empty="No audio versions yet. Upload one to get started."
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
