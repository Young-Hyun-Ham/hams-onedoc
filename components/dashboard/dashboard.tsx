"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  ArrowRight,
  FolderOpen,
  Files,
  GitCompareArrows,
  CircleCheck,
  Sparkles,
  Plus,
  ChevronRight,
  Clock3,
} from "lucide-react";
import {
  Badge,
  Card,
  EmptyState,
  PageHeading,
  TextLink,
} from "@/components/ui/primitives";
import {
  projects,
  projectDocuments,
  changes,
  projectHref,
} from "@/lib/mock/fixtures";
import { DocumentTable } from "@/components/project/document-table";

export function Dashboard() {
  const router = useRouter();
  const params = useSearchParams();
  const selected = params.get("projectId") || "";
  const visibleProjects = projects.filter(
    (p) => !selected || p.id === selected,
  );
  const docs = projectDocuments(selected || undefined);
  const current = visibleProjects[0];
  const reviewCount = docs.filter((d) => d.status === "검토 필요").length;
  const visibleChanges = changes.filter(
    (c) => !selected || c.projectId === selected,
  );
  const stats = [
    {
      label: "진행 프로젝트",
      count: visibleProjects.length,
      unit: "개",
      detail: "프로젝트별 문서와 작업 현황",
      icon: FolderOpen,
    },
    {
      label: "전체 문서",
      count: docs.length,
      unit: "개",
      detail: "원본부터 설계서까지 한곳에서",
      icon: Files,
    },
    {
      label: "검토 필요",
      count: reviewCount,
      unit: "건",
      detail: "담당자의 확인이 기다리고 있어요",
      icon: CircleCheck,
    },
    {
      label: "최근 변경",
      count: visibleChanges.length,
      unit: "건",
      detail: "연결된 산출물의 영향 확인",
      icon: GitCompareArrows,
    },
  ];
  const steps = [
    ["RFP 분석", "rfp"],
    ["요구사항 구조화", "requirements"],
    ["설계서 초안 생성", "generate"],
    ["변경 영향·버전 관리", "changes"],
    ["산출물 통합관리", "artifacts"],
  ];
  return (
    <>
      <PageHeading
        eyebrow="YOUR PROJECT, ONE DOCUMENT FLOW"
        title="대시보드"
        description="프로젝트 문서를 하나의 흐름으로 관리합니다."
        actions={
          <>
            <label className="sr-only" htmlFor="dashboard-project">
              대시보드 프로젝트 선택
            </label>
            <select
              id="dashboard-project"
              className="select !w-auto !max-w-full"
              value={selected}
              onChange={(e) =>
                router.push(
                  e.target.value ? `/?projectId=${e.target.value}` : "/",
                )
              }
            >
              <option value="">전체 프로젝트</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <Link
              className="button button-primary"
              href={projectHref(current?.id || projects[0].id, "rfp")}
            >
              <Plus size={14} />
              RFP로 시작하기
            </Link>
          </>
        }
      />
      {!current ? (
        <EmptyState
          title="프로젝트를 찾을 수 없습니다"
          description="선택한 프로젝트가 샘플 목록에 없습니다."
          action={
            <Link className="button" href="/">
              전체 프로젝트 보기
            </Link>
          }
        />
      ) : (
        <>
          <section
            className="workflow-banner"
            aria-label="프로젝트 문서 생성 흐름"
          >
            <div className="workflow-top">
              <div className="workflow-title">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Sparkles size={20} />
                </span>
                <div>
                  <h2>한 번의 시작, 연결되는 모든 문서</h2>
                  <p>
                    RFP를 출발점으로 요구사항과 설계, 변경 이력까지 연결하세요.
                  </p>
                </div>
              </div>
              <Badge tone="brand">AI DOCUMENT WORKFLOW</Badge>
            </div>
            <div className="workflow-steps">
              {steps.map(([title, tab], i) => (
                <Link
                  key={tab}
                  className="workflow-step"
                  href={projectHref(current.id, tab)}
                >
                  <span className="step-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{title}</span>
                  {i < 4 && <ChevronRight size={14} />}
                </Link>
              ))}
            </div>
            <p className="mt-2 text-[9px] text-muted">
              WBS · 아키텍처 · 화면 · 기능 · DB 설계서로 이어지는 샘플
              흐름입니다.
            </p>
          </section>
          <div className="stat-grid">
            {stats.map(({ label, count, unit, detail, icon: Icon }) => (
              <div className="panel stat-card" key={label}>
                <div className="stat-top">
                  <span>{label}</span>
                  <span className="stat-icon">
                    <Icon size={16} />
                  </span>
                </div>
                <p className="stat-number">
                  {String(count).padStart(2, "0")}
                  <span>{unit}</span>
                </p>
                <p className="stat-bottom">{detail}</p>
              </div>
            ))}
          </div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="section-title">진행 중인 프로젝트</h2>
              <Badge>{visibleProjects.length}</Badge>
            </div>
            <span className="text-[10px] text-muted">
              프로젝트를 선택해 작업을 이어가세요
            </span>
          </div>
          <div className="project-grid">
            {visibleProjects.map((project) => {
              const projectDocs = projectDocuments(project.id);
              const approved = projectDocs.filter(
                (d) => d.status === "승인 완료",
              ).length;
              const needsReview = projectDocs.filter(
                (d) => d.status === "검토 필요",
              ).length;
              return (
                <Link
                  className="panel project-card"
                  key={project.id}
                  href={projectHref(project.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className={`project-monogram ${project.color}`}>
                      {project.initials}
                    </span>
                    <Badge
                      tone={
                        project.id === "commerce"
                          ? "brand"
                          : project.id === "workspace"
                            ? "blue"
                            : "success"
                      }
                    >
                      {project.stage}
                    </Badge>
                  </div>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <div className="mt-4 flex items-center justify-between text-[9px] text-muted">
                    <span>문서 승인 현황</span>
                    <span>
                      {approved} / {projectDocs.length}
                    </span>
                  </div>
                  <div className="progress-track mt-2">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(approved / projectDocs.length) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="project-card-bottom">
                    <span className="flex items-center gap-1">
                      <Clock3 size={12} />
                      검토 필요 {needsReview}건
                    </span>
                    <span className="flex items-center gap-1">
                      {project.client}
                      <ArrowUpRight size={13} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
            <Card
              title="최근 산출물"
              description="프로젝트의 최신 문서를 확인하세요."
              action={
                <TextLink href={projectHref(current.id, "artifacts")}>
                  전체 보기
                </TextLink>
              }
            >
              <DocumentTable
                items={[...docs]
                  .filter((d) => d.kind !== "RFP")
                  .sort((a, b) => b.updated.localeCompare(a.updated))
                  .slice(0, 4)}
              />
            </Card>
            <Card
              title="변경 영향 살펴보기"
              description="요구사항과 연결된 산출물"
              action={<GitCompareArrows size={16} className="text-brand" />}
            >
              <div className="px-5 pb-5">
                <Badge tone="warning">검토 필요 · 샘플 관계</Badge>
                <h3 className="mt-3 text-xs font-semibold leading-6">
                  {visibleChanges[0].title}
                </h3>
                <p className="mt-2 text-[10px] leading-5 text-muted">
                  REQ-002 변경에 따라 기능 명세와 화면설계의 재검토가
                  필요합니다.
                </p>
                <div className="my-4 flex flex-wrap items-center gap-2">
                  <span className="requirement-code">REQ-002</span>
                  <ArrowRight size={12} className="text-muted" />
                  <Badge>FUNC-002</Badge>
                  <Badge>화면설계서</Badge>
                </div>
                <Link
                  className="button button-small w-full"
                  href={projectHref(current.id, "changes")}
                >
                  영향 후보 확인
                  <ArrowRight size={13} />
                </Link>
              </div>
            </Card>
          </div>
          <div className="mt-6 flex items-center justify-between rounded-lg border border-border bg-surface px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-brand">
                <Sparkles size={17} />
              </span>
              <div>
                <p className="text-xs font-semibold">
                  다음 문서도 같은 맥락으로
                </p>
                <p className="mt-1 text-[10px] text-muted">
                  검토한 요구사항을 바탕으로 문서 생성 흐름을 살펴보세요.
                </p>
              </div>
            </div>
            <TextLink href={projectHref(current.id, "generate")}>
              문서 생성
            </TextLink>
          </div>
        </>
      )}
    </>
  );
}
