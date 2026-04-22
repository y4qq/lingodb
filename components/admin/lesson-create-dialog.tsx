"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createLesson } from "@/lib/domains/courses/actions/admin";
import { FormField } from "@/components/admin/form-field";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function LessonCreateDialog({ unitId }: { unitId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Create lesson
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create lesson</DialogTitle>
          <DialogDescription>
            Starts as a draft at the end of the lesson list.
          </DialogDescription>
        </DialogHeader>
        <CreateLessonForm unitId={unitId} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function CreateLessonForm({
  unitId,
  onClose,
}: {
  unitId: string;
  onClose: () => void;
}) {
  const [state, action, isPending] = useActionState(createLesson, undefined);
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) {
      onClose();
      router.refresh();
    }
  }, [state, onClose, router]);

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const summaryError = state && !state.ok ? state.error : undefined;

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="unitId" value={unitId} />

      <FormField
        id="slug"
        label="Slug"
        description="lowercase-kebab-case; unique within this unit"
        error={fieldErrors?.slug?.[0]}
      >
        <Input id="slug" name="slug" required placeholder="hello" />
      </FormField>

      <FormField id="title" label="Title" error={fieldErrors?.title?.[0]}>
        <Input id="title" name="title" required placeholder="Hello" />
      </FormField>

      <FormField
        id="description"
        label="Description"
        description="Optional"
        error={fieldErrors?.description?.[0]}
      >
        <Textarea id="description" name="description" rows={3} />
      </FormField>

      {summaryError && (
        <p className="text-destructive text-sm">{summaryError}</p>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating…" : "Create lesson"}
        </Button>
      </DialogFooter>
    </form>
  );
}
