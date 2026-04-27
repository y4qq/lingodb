"use client";

import { useState, type KeyboardEvent } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

const sizeClass: Record<Size, string> = {
  sm: "size-4",
  md: "size-6",
  lg: "size-10",
};

type Props = {
  value: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: Size;
  ariaLabel?: string;
  className?: string;
};

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md",
  ariaLabel = "Rating",
  className,
}: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;
  const interactive = !readOnly && onChange !== undefined;

  function handleKey(e: KeyboardEvent<HTMLDivElement>) {
    if (!interactive) return;
    if (e.key >= "1" && e.key <= "5") {
      e.preventDefault();
      onChange?.(Number(e.key));
      return;
    }
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange?.(Math.min(5, Math.max(1, value + 1)));
      return;
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange?.(Math.max(1, value - 1));
      return;
    }
  }

  return (
    <div
      role={interactive ? "radiogroup" : "img"}
      aria-label={`${ariaLabel}: ${value} of 5 stars`}
      tabIndex={interactive ? 0 : -1}
      onKeyDown={handleKey}
      onMouseLeave={() => setHover(null)}
      className={cn(
        "inline-flex items-center gap-1",
        interactive &&
          "rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring/50",
        className,
      )}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= display;
        return (
          <button
            key={star}
            type="button"
            role={interactive ? "radio" : undefined}
            aria-checked={interactive ? star === value : undefined}
            aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
            disabled={!interactive}
            tabIndex={-1}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => interactive && setHover(star)}
            className={cn(
              "rounded-sm transition-colors",
              interactive
                ? "cursor-pointer text-muted-foreground hover:text-amber-500"
                : "cursor-default",
              filled && "text-amber-500",
            )}
          >
            <Star
              className={cn(sizeClass[size], filled && "fill-current")}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}
