"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import { updateLesson } from "@/lib/domains/courses/actions/admin";
import { FormField } from "@/components/admin/form-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  position: number;
  isPublished: boolean;
};

export function LessonEditDialog({ lesson }: { lesson: Lesson }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon-sm" aria-label="Edit lesson">
          <Settings />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit lesson</DialogTitle>
          <DialogDescription>
            Update this lesson&apos;s settings. Slug cannot be changed.
          </DialogDescription>
        </DialogHeader>
        <EditLessonForm lesson={lesson} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function EditLessonForm({
  lesson,
  onClose,
}: {
  lesson: Lesson;
  onClose: () => void;
}) {
  const [state, action, isPending] = useActionState(updateLesson, undefined);
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
      <input type="hidden" name="id" value={lesson.id} />

      <FormField id="title" label="Title" error={fieldErrors?.title?.[0]}>
        <Input
          id="title"
          name="title"
          defaultValue={lesson.title}
          required
        />
      </FormField>

      <FormField
        id="icon"
        label="Icon"
        description="A single emoji — paste from the OS emoji picker"
        error={fieldErrors?.icon?.[0]}
      >
        <Input
          id="icon"
          name="icon"
          defaultValue={lesson.icon ?? ""}
          required
          maxLength={16}
          autoComplete="off"
          placeholder="👋"
        />
      </FormField>

      <FormField
        id="description"
        label="Description"
        description="Optional"
        error={fieldErrors?.description?.[0]}
      >
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={lesson.description ?? ""}
        />
      </FormField>

      <FormField
        id="position"
        label="Position"
        description="Ordering within the unit (lower = earlier)"
        error={fieldErrors?.position?.[0]}
      >
        <Input
          id="position"
          name="position"
          type="number"
          min={0}
          step={1}
          defaultValue={lesson.position}
          required
        />
      </FormField>

      <div className="flex items-center gap-2">
        <Checkbox
          id="isPublished"
          name="isPublished"
          defaultChecked={lesson.isPublished}
        />
        <Label htmlFor="isPublished" className="cursor-pointer">
          Published
        </Label>
      </div>

      {summaryError && (
        <p className="text-destructive text-sm">{summaryError}</p>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}
