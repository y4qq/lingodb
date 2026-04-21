"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createCourseAction } from "@/lib/domains/courses/actions/admin";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

type Language = {
  id: string;
  code: string;
  name: string;
};

export function NewCourseForm({ languages }: { languages: Language[] }) {
  const [state, action, isPending] = useActionState(
    createCourseAction,
    undefined,
  );
  const router = useRouter();

  useEffect(() => {
    if (state?.ok) {
      router.push("/admin/courses");
    }
  }, [state, router]);

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const summaryError = state && !state.ok ? state.error : undefined;

  return (
    <form action={action} className="flex flex-col gap-6">
      <Field
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
      </Field>

      <Field
        id="title"
        label="Title"
        error={fieldErrors?.title?.[0]}
      >
        <Input
          id="title"
          name="title"
          required
          placeholder="Thai for English Speakers"
        />
      </Field>

      <Field
        id="description"
        label="Description"
        description="Optional"
        error={fieldErrors?.description?.[0]}
      >
        <Textarea id="description" name="description" rows={3} />
      </Field>

      <Field
        id="baseLanguageId"
        label="Base language"
        description="The language learners already speak"
        error={fieldErrors?.baseLanguageId?.[0]}
      >
        <LanguageSelect name="baseLanguageId" languages={languages} />
      </Field>

      <Field
        id="targetLanguageId"
        label="Target language"
        description="The language being taught"
        error={fieldErrors?.targetLanguageId?.[0]}
      >
        <LanguageSelect name="targetLanguageId" languages={languages} />
      </Field>

      <div className="flex items-center gap-2">
        <Checkbox id="isFree" name="isFree" defaultChecked />
        <Label htmlFor="isFree" className="cursor-pointer">
          Free course
        </Label>
      </div>

      {summaryError && (
        <p className="text-destructive text-sm">{summaryError}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating…" : "Create course"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  description,
  error,
  children,
}: {
  id: string;
  label: string;
  description?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {description && !error && (
        <p className="text-muted-foreground text-xs">{description}</p>
      )}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
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
