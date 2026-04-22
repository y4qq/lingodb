import { AppShell } from "@/components/app/app-shell";

export default function EnrollLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
