import type { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Tone = "info" | "success" | "error";

const toneClasses: Record<Tone, string> = {
  info: "bg-primary/10 text-primary ring-primary/20",
  success:
    "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
  error:
    "bg-destructive/10 text-destructive ring-destructive/20",
};

type Props = {
  tone?: Tone;
  icon: ReactNode;
  title: string;
  description: ReactNode;
  footer?: ReactNode;
};

export function AuthStatusCard({
  tone = "info",
  icon,
  title,
  description,
  footer,
}: Props) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col items-center gap-4 pt-8 text-center">
            <div
              className={cn(
                "flex size-12 items-center justify-center rounded-full ring-1 ring-inset [&_svg]:size-5",
                toneClasses[tone],
              )}
              aria-hidden
            >
              {icon}
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
              <div className="text-muted-foreground text-sm leading-relaxed">
                {description}
              </div>
            </div>
          </CardHeader>
          {footer && (
            <CardContent className="flex flex-col gap-2 pb-6">
              {footer}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
