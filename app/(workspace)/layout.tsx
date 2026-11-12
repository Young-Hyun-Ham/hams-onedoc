import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingState } from "@/components/ui/primitives";
export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingState />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
