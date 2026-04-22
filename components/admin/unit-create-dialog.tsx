"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createUnit } from "@/lib/domains/courses/actions/admin";
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

export function UnitCreateDialog({ courseId }: { courseId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Create unit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create unit</DialogTitle>
          <DialogDescription>
            Starts as a draft at the end of the unit list.
          </DialogDescription>
        </DialogHeader>
        <CreateUnitForm courseId={courseId} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function CreateUnitForm({
  courseId,
  onClose,
}: {
  courseId: string;
  onClose: () => void;
}) {
  const [state, action, isPending] = useActionState(createUnit, undefined);
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
      <input type="hidden" name="courseId" value={courseId} />

      <FormField
        id="slug"
        label="Slug"
        description="lowercase-kebab-case; unique within this course"
        error={fieldErrors?.slug?.[0]}
      >
        <Input
          id="slug"
          name="slug"
          required
          placeholder="greetings"
        />
      </FormField>

      <FormField id="title" label="Title" error={fieldErrors?.title?.[0]}>
        <Input
          id="title"
          name="title"
          required
          placeholder="Greetings"
        />
      </FormField>

      <FormField
        id="description"
        label="Description"
        description="Optional"
        error={fieldErrors?.description?.[0]}
      >
        <Textarea id="description" name="description" rows={3} />
      </FormField>

      <div className="flex items-center gap-2">
        <Checkbox id="isFree" name="isFree" defaultChecked />
        <Label htmlFor="isFree" className="cursor-pointer">
          Free unit
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
          {isPending ? "Creating…" : "Create unit"}
        </Button>
      </DialogFooter>
    </form>
  );
}
