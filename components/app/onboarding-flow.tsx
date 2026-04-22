"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  completeOnboarding,
  setMyDisplayName,
} from "@/lib/domains/users/actions/user";
import { cn } from "@/lib/utils";

type Course = {
  id: string;
  title: string;
  description: string | null;
  baseLanguage: { name: string };
  targetLanguage: { name: string };
};

type Props = {
  initialDisplayName: string | null;
  courses: Course[];
};

export function OnboardingFlow({ initialDisplayName, courses }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState(initialDisplayName ?? "");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  const [nameState, nameAction, namePending] = useActionState(
    setMyDisplayName,
    undefined,
  );
  const [enrollState, enrollAction, enrollPending] = useActionState(
    completeOnboarding,
    undefined,
  );
  const [, startTransition] = useTransition();

  // On a successful name save, advance to step 2.
  useEffect(() => {
    if (nameState?.ok) setStep(2);
  }, [nameState]);

  const trimmedName = name.trim();
  const canContinueStep1 = trimmedName.length > 0 && !namePending;
  const canFinishStep2 =
    selectedCourseId !== null && courses.length > 0 && !enrollPending;

  const nameError =
    nameState && !nameState.ok ? (nameState.error ?? null) : null;
  const nameFieldError =
    nameState && !nameState.ok ? nameState.fieldErrors?.name?.[0] : undefined;
  const enrollError =
    enrollState && !enrollState.ok ? (enrollState.error ?? null) : null;

  function handleContinue() {
    if (step === 1) {
      const fd = new FormData();
      fd.append("name", trimmedName);
      startTransition(() => nameAction(fd));
      return;
    }
    if (!selectedCourseId) return;
    const fd = new FormData();
    fd.append("courseId", selectedCourseId);
    startTransition(() => enrollAction(fd));
  }

  function handleBack() {
    if (step === 2) setStep(1);
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b px-6 py-4">
        <Progress value={step === 1 ? 50 : 100} />
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {step === 1 ? (
            <StepName
              name={name}
              onChange={setName}
              fieldError={nameFieldError}
              error={nameError}
              onSubmit={handleContinue}
              disabled={namePending}
            />
          ) : (
            <StepCourse
              courses={courses}
              selectedCourseId={selectedCourseId}
              onSelect={setSelectedCourseId}
              error={enrollError}
            />
          )}
        </div>
      </main>

      <footer className="border-t px-6 py-4">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={step === 1 || namePending || enrollPending}
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={handleContinue}
            disabled={
              (step === 1 && !canContinueStep1) ||
              (step === 2 && !canFinishStep2)
            }
          >
            {step === 2
              ? enrollPending
                ? "Finishing…"
                : "Finish"
              : namePending
                ? "Saving…"
                : "Continue"}
          </Button>
        </div>
      </footer>
    </div>
  );
}

function StepName({
  name,
  onChange,
  fieldError,
  error,
  onSubmit,
  disabled,
}: {
  name: string;
  onChange: (v: string) => void;
  fieldError?: string;
  error: string | null;
  onSubmit: () => void;
  disabled: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">What should we call you?</CardTitle>
        <CardDescription>
          This is how you&apos;ll show up across Fluent Fast. You can change
          it later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="flex flex-col gap-2"
        >
          <Label htmlFor="display-name">Display name</Label>
          <Input
            id="display-name"
            name="name"
            value={name}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. Sam"
            maxLength={60}
            autoFocus
            disabled={disabled}
          />
          {fieldError && (
            <p className="text-destructive text-xs">{fieldError}</p>
          )}
          {error && !fieldError && (
            <p className="text-destructive text-xs">{error}</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function StepCourse({
  courses,
  selectedCourseId,
  onSelect,
  error,
}: {
  courses: Course[];
  selectedCourseId: string | null;
  onSelect: (id: string) => void;
  error: string | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Pick your first course
        </h1>
        <p className="text-muted-foreground text-sm">
          You can enroll in more courses later from the sidebar.
        </p>
      </div>
      {courses.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">No courses available yet</CardTitle>
            <CardDescription>
              Please check back soon — new courses are on the way.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {courses.map((course) => {
            const selected = course.id === selectedCourseId;
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => onSelect(course.id)}
                aria-pressed={selected}
                className={cn(
                  "text-left transition-colors focus-visible:outline-hidden",
                  "rounded-xl focus-visible:ring-2 focus-visible:ring-ring/50",
                )}
              >
                <Card
                  className={cn(
                    "h-full gap-2 transition-colors",
                    selected
                      ? "border-primary ring-2 ring-primary/40"
                      : "hover:border-foreground/20",
                  )}
                >
                  <CardHeader>
                    <CardTitle className="text-base">{course.title}</CardTitle>
                    <CardDescription>
                      {course.baseLanguage.name} → {course.targetLanguage.name}
                    </CardDescription>
                  </CardHeader>
                  {course.description && (
                    <CardContent className="text-muted-foreground text-sm">
                      {course.description}
                    </CardContent>
                  )}
                </Card>
              </button>
            );
          })}
        </div>
      )}
      {error && <p className="text-destructive text-center text-xs">{error}</p>}
    </div>
  );
}
