import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: number | string;
  hint?: string;
  icon?: ReactNode;
};

export function StatCard({ label, value, hint, icon }: StatCardProps) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          {icon && <span className="[&>svg]:size-4">{icon}</span>}
          {label}
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tracking-tight">
          {value}
        </CardTitle>
      </CardHeader>
      {hint && (
        <CardContent className="text-muted-foreground text-xs">
          {hint}
        </CardContent>
      )}
    </Card>
  );
}
