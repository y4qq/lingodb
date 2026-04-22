"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createCourse } from "@/lib/domains/courses/actions/admin";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type Language = { id: string; code: string; name: string };

export function CourseCreateDialog({ languages }: { languages: Language[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Create course
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create course</DialogTitle>
          <DialogDescription>
            Starts as a draft. Publish it once its units and lessons are ready.
          </DialogDescription>
        </DialogHeader>
        <CreateCourseForm
          languages={languages}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function CreateCourseForm({
  languages,
  onClose,
}: {
  languages: Language[];
  onClose: () => void;
}) {
  const [state, action, isPending] = useActionState(createCourse, undefined);
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) {
      onClose();
      router.push(`/admin/courses/${state.data.slug}`);
    }
  }, [state, onClose, router]);

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const summaryError = state && !state.ok ? state.error : undefined;

  return (
    <form action={action} className="flex flex-col gap-4">
      <FormField
        id="slug"
        label="Slug"
        description="lowercase-kebab-case; unique across all courses"
        error={fieldErrors?.slug?.[0]}
      >
        <Input
          id="slug"
          name="slug"
          required
          placeholder="thai-for-english-speakers"
        />
      </FormField>

      <FormField id="title" label="Title" error={fieldErrors?.title?.[0]}>
        <Input
          id="title"
          name="title"
          required
          placeholder="Thai for English Speakers"
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

      <FormField
        id="baseLanguageId"
        label="Base language"
        description="The language learners already speak"
        error={fieldErrors?.baseLanguageId?.[0]}
      >
        <LanguageSelect name="baseLanguageId" languages={languages} />
      </FormField>

      <FormField
        id="targetLanguageId"
        label="Target language"
        description="The language being taught"
        error={fieldErrors?.targetLanguageId?.[0]}
      >
        <LanguageSelect name="targetLanguageId" languages={languages} />
      </FormField>

      <div className="flex items-center gap-2">
        <Checkbox id="isFree" name="isFree" defaultChecked />
        <Label htmlFor="isFree" className="cursor-pointer">
          Free course
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
          {isPending ? "Creating…" : "Create course"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function LanguageSelect({
  name,
  languages,
}: {
  name: string;
  languages: Language[];
}) {
  return (
    <Select name={name}>
      <SelectTrigger id={name}>
        <SelectValue placeholder="Select a language" />
      </SelectTrigger>
      <SelectContent>
        {languages.map((l) => (
          <SelectItem key={l.id} value={l.id}>
            {l.name} ({l.code})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
