"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import { updateUnit } from "@/lib/domains/courses/actions/admin";
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

type Unit = {
  id: string;
  title: string;
  description: string | null;
  position: number;
  isPublished: boolean;
  isFree: boolean;
};

export function UnitEditDialog({ unit }: { unit: Unit }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon-sm" aria-label="Edit unit">
          <Settings />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit unit</DialogTitle>
          <DialogDescription>
            Update this unit&apos;s settings. Slug cannot be changed.
          </DialogDescription>
        </DialogHeader>
        <EditUnitForm unit={unit} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function EditUnitForm({
  unit,
  onClose,
}: {
  unit: Unit;
  onClose: () => void;
}) {
  const [state, action, isPending] = useActionState(updateUnit, undefined);
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
      <input type="hidden" name="id" value={unit.id} />

      <FormField id="title" label="Title" error={fieldErrors?.title?.[0]}>
        <Input
          id="title"
          name="title"
          defaultValue={unit.title}
          required
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
          defaultValue={unit.description ?? ""}
        />
      </FormField>

      <FormField
        id="position"
        label="Position"
        description="Ordering within the course (lower = earlier)"
        error={fieldErrors?.position?.[0]}
      >
        <Input
          id="position"
          name="position"
          type="number"
          min={0}
          step={1}
          defaultValue={unit.position}
          required
        />
      </FormField>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Checkbox
            id="isPublished"
            name="isPublished"
            defaultChecked={unit.isPublished}
          />
          <Label htmlFor="isPublished" className="cursor-pointer">
            Published
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="isFree"
            name="isFree"
            defaultChecked={unit.isFree}
          />
          <Label htmlFor="isFree" className="cursor-pointer">
            Free
          </Label>
        </div>
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
