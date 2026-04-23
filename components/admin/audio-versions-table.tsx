"use client";

import { useAudioPlayer } from "@/components/audio-player";
import { useAudioSelection } from "@/components/admin/audio-selection-provider";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FloatingPanelTable,
  FloatingPanelTableBody,
  FloatingPanelTableCell,
  FloatingPanelTableHead,
  FloatingPanelTableHeader,
  FloatingPanelTableRow,
} from "@/components/ui/floating-panel";

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

  if (versions.length === 0) {
    return (
      <p className="px-8 py-10 text-base text-muted-foreground">
        No audio versions yet. Upload one to get started.
      </p>
    );
  }

  return (
    <FloatingPanelTable>
      <FloatingPanelTableHeader>
        <tr>
          <FloatingPanelTableHead className="w-16" />
          <FloatingPanelTableHead>Label</FloatingPanelTableHead>
          <FloatingPanelTableHead>Duration</FloatingPanelTableHead>
          <FloatingPanelTableHead>Added</FloatingPanelTableHead>
          <FloatingPanelTableHead className="w-48">Status</FloatingPanelTableHead>
        </tr>
      </FloatingPanelTableHeader>
      <FloatingPanelTableBody>
        {versions.map((v) => {
          const isSelected = selectedId === v.id;
          return (
            <FloatingPanelTableRow
              key={v.id}
              data-state={isSelected ? "selected" : undefined}
              className="cursor-pointer"
              onClick={() => {
                if (!v.signedUrl) return;
                play({
                  id: v.id,
                  label: v.label,
                  src: v.signedUrl,
                  durationSeconds: v.audioDurationSeconds,
                });
              }}
            >
              <FloatingPanelTableCell>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    setSelectedId(checked ? v.id : null)
                  }
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Select ${v.label}`}
                />
              </FloatingPanelTableCell>
              <FloatingPanelTableCell>
                <span className="font-heading font-semibold">{v.label}</span>
              </FloatingPanelTableCell>
              <FloatingPanelTableCell className="font-mono tabular-nums text-muted-foreground">
                {formatDuration(v.audioDurationSeconds)}
              </FloatingPanelTableCell>
              <FloatingPanelTableCell className="text-muted-foreground">
                {formatDate(v.createdAt)}
              </FloatingPanelTableCell>
              <FloatingPanelTableCell>
                <div className="flex items-center gap-1.5">
                  {v.isCurrent && <Badge>Current</Badge>}
                  {v.disabledAt !== null && (
                    <Badge variant="secondary">Disabled</Badge>
                  )}
                  {track?.id === v.id && (
                    <Badge variant="outline">Playing</Badge>
                  )}
                </div>
              </FloatingPanelTableCell>
            </FloatingPanelTableRow>
          );
        })}
      </FloatingPanelTableBody>
    </FloatingPanelTable>
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
