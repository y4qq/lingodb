"use client";

import "react-flagpack-react-19/dist/style.css";
import Flag from "react-flagpack-react-19";
import { flagForLanguageCode } from "@/lib/domains/courses/language-flags";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export type LanguageCourseCardData = {
  id: string;
  title: string;
  targetLanguage: {
    code: string;
    name: string;
  };
};

type Props = {
  course: LanguageCourseCardData;
  selected?: boolean;
  pending?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export function LanguageCourseCard({
  course,
  selected = false,
  pending = false,
  disabled = false,
  onClick,
}: Props) {
  const { name, code } = course.targetLanguage;
  const flag = flagForLanguageCode(code);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || pending}
      aria-pressed={selected}
      className={cn(
        "group text-left transition-colors focus-visible:outline-hidden",
        "rounded-xl focus-visible:ring-2 focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      <Card
        className={cn(
          "h-full items-center gap-3 p-4 transition-colors",
          selected
            ? "border-primary ring-2 ring-primary/40"
            : "group-hover:border-foreground/20",
        )}
      >
        <div className="flex h-12 items-center justify-center">
          {flag ? (
            <Flag code={flag} size="L" hasBorderRadius hasBorder />
          ) : (
            <div className="bg-muted size-10 rounded-sm" aria-hidden />
          )}
        </div>
        <div className="text-center text-sm font-semibold tracking-tight">
          {name}
        </div>
        {pending && (
          <Spinner className="text-muted-foreground size-4" aria-label="Enrolling" />
        )}
      </Card>
    </button>
  );
}
