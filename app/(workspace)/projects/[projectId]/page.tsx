import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProjectWorkspace } from "@/components/project/project-workspace";
import { LoadingState } from "@/components/ui/primitives";
import { projects } from "@/lib/mock/fixtures";
export function generateStaticParams() {
  return projects.map((project) => ({ projectId: project.id }));
}
async function ProjectContent({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  if (!projects.some((project) => project.id === projectId)) notFound();
  return <ProjectWorkspace projectId={projectId} />;
}
export default function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  return (
    <Suspense fallback={<LoadingState />}>
      <ProjectContent params={params} />
    </Suspense>
  );
}
