"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import {
  disableAudioVersion,
  enableAudioVersion,
  setCurrentAudioVersion,
} from "@/lib/domains/courses/actions/admin";
import { useAudioSelection } from "@/components/admin/audio-selection-provider";
import type { AudioVersion } from "@/components/admin/audio-versions-table";
import { AudioVersionUploader } from "@/components/admin/audio-version-uploader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  lessonId: string;
  versions: AudioVersion[];
};

export function AudioVersionsHeaderActions({ lessonId, versions }: Props) {
  return (
    <div className="flex items-center gap-2">
      <AudioVersionUploader lessonId={lessonId} />
      <AudioVersionActionsDialog versions={versions} />
    </div>
  );
}

function AudioVersionActionsDialog({ versions }: { versions: AudioVersion[] }) {
  const [open, setOpen] = useState(false);
  const { selectedId } = useAudioSelection();
  const selected = versions.find((v) => v.id === selectedId) ?? null;

  if (!selected) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {/* span wrapper so the tooltip still shows on a disabled button */}
          <span>
            <Button
              variant="outline"
              size="icon-sm"
              disabled
              aria-label="Manage version"
            >
              <Settings />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Select a version first</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon-sm" aria-label="Manage version">
          <Settings />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <ActionsBody version={selected} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function ActionsBody({
  version,
  onClose,
}: {
  version: AudioVersion;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const isDisabled = version.disabledAt !== null;
  const canSetCurrent = !version.isCurrent && !isDisabled;

  function run(
    action: (input: { versionId: string }) => Promise<
      | { ok: true; data: { versionId: string } }
      | { ok: false; error?: string; fieldErrors?: Record<string, string[]> }
    >,
  ) {
    setError(null);
    startTransition(async () => {
      const result = await action({ versionId: version.id });
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Manage audio version</DialogTitle>
        <DialogDescription className="flex items-center gap-2">
          <span className="font-medium">{version.label}</span>
          {version.isCurrent && <Badge>Current</Badge>}
          {isDisabled ? (
            <Badge variant="secondary">Disabled</Badge>
          ) : (
            <Badge variant="outline">Enabled</Badge>
          )}
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-2">
        {canSetCurrent && (
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => run(setCurrentAudioVersion)}
          >
            Set as current
          </Button>
        )}
        {isDisabled ? (
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => run(enableAudioVersion)}
          >
            Enable
          </Button>
        ) : (
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            disabled={pending}
            onClick={() => run(disableAudioVersion)}
          >
            Disable
          </Button>
        )}
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </>
  );
}
