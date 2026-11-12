"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  FileUp,
  Info,
  Sparkles,
  GitCompareArrows,
  Check,
  Clock3,
  Download,
  SlidersHorizontal,
} from "lucide-react";
import {
  Badge,
  Card,
  Dialog,
  DocumentIcon,
  EmptyState,
  PageHeading,
  SearchField,
  StatusBadge,
  TextLink,
} from "@/components/ui/primitives";
import { useUI } from "@/components/providers/app-store-provider";
import { DocumentTable } from "@/components/project/document-table";
import {
  changes,
  documents,
  projectDocuments,
  projectHref,
  projects,
  requirements,
} from "@/lib/mock/fixtures";
import { tabLabels } from "@/lib/navigation";
import {
  projectTabs,
  type ProjectDocument,
  type ProjectTab,
  type Requirement,
} from "@/lib/types/domain";

function SourceNote() {
  return (
    <div className="notice-banner mb-5">
      <Info size={15} />
      <p>
        샘플 데이터로 구성한 읽기 전용 프리뷰입니다. 실제 업로드, AI 실행, 저장
        및 다운로드는 연결되지 않았습니다.
      </p>
    </div>
  );
}
function RequirementDetail({
  requirement,
  onClose,
}: {
  requirement: Requirement;
  onClose: () => void;
}) {
  const linked = documents.filter(
    (d) => d.kind !== "RFP" && d.requirementIds.includes(requirement.id),
  );
  return (
    <Dialog
      title={requirement.title}
      description={`${requirement.code} · ${requirement.type} 요구사항 · 샘플`}
      onClose={onClose}
    >
      <dl className="detail-list">
        <dt>요구사항 ID</dt>
        <dd className="requirement-code">{requirement.code}</dd>
        <dt>내용</dt>
        <dd>{requirement.description}</dd>
        <dt>원문 근거</dt>
        <dd>
          <Link
            className="text-brand underline underline-offset-4"
            href={projectHref(requirement.projectId, "rfp")}
          >
            {requirement.source}
          </Link>
        </dd>
        <dt>관련 기능</dt>
        <dd className="requirement-code">{requirement.functionId}</dd>
        <dt>검토 상태</dt>
        <dd>
          <Badge
            tone={requirement.status === "검토 필요" ? "warning" : "success"}
          >
            {requirement.status}
          </Badge>
        </dd>
        <dt>연결 산출물</dt>
        <dd className="flex flex-col items-start gap-2">
          {linked.map((d) => (
            <Link
              key={d.id}
              className="text-link !text-brand"
              href={projectHref(d.projectId, "artifacts", { doc: d.id })}
            >
              {d.kind} {d.version}
              <ArrowRight size={12} />
            </Link>
          ))}
        </dd>
      </dl>
    </Dialog>
  );
}
function DocumentPreview({
  doc,
  onClose,
}: {
  doc: ProjectDocument;
  onClose: () => void;
}) {
  const notify = useUI((s) => s.notify);
  const related = requirements.filter((r) => doc.requirementIds.includes(r.id));
  return (
    <Dialog
      wide
      title={doc.name}
      description={`${doc.version} · ${doc.owner} · ${doc.updated} · 읽기 전용 샘플`}
      onClose={onClose}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <StatusBadge status={doc.status} />
        <button
          className="button button-small"
          onClick={() =>
            notify(
              "실제 파일 다운로드는 후속 파일 생성 기능 연동 후 제공됩니다.",
            )
          }
        >
          <Download size={13} />
          다운로드 · 준비 중
        </button>
      </div>
      <article className="prose-document">
        <p className="!text-[9px] tracking-widest text-brand">
          HAMS ONEDOC / SAMPLE DOCUMENT
        </p>
        <h3>{doc.kind === "RFP" ? "프로젝트 제안요청서" : doc.kind}</h3>
        <p className="text-muted">{doc.name}</p>
        <hr className="my-5 border-border" />
        <h4>1. 문서 목적</h4>
        <p>
          {doc.kind === "RFP"
            ? "프로젝트의 업무 범위와 기능·비기능 요구사항을 정의합니다. 아래 내용은 원본 파일을 대신하는 미리보기 예시입니다."
            : "검토된 요구사항을 기준으로 프로젝트의 설계 방향과 산출물의 연결 관계를 설명합니다. 아래 내용은 AI가 실행한 결과가 아닌 퍼블리싱 예시입니다."}
        </p>
        <h4>2. {doc.kind === "기능 명세서" ? "기능 정의" : "주요 구성"}</h4>
        {doc.kind === "기능 명세서" ? (
          related.map((r) => (
            <section key={r.id} className="my-4 border-b border-border pb-4">
              <p className="font-semibold">
                {r.functionId} · {r.title}
              </p>
              <p className="text-muted">{r.description}</p>
              <p>
                관련 요구사항:{" "}
                <Link
                  className="requirement-code underline"
                  href={projectHref(doc.projectId, "requirements", {
                    req: r.id,
                  })}
                >
                  {r.code}
                </Link>
              </p>
            </section>
          ))
        ) : (
          <ul className="list-inside list-disc text-muted">
            {(doc.kind === "WBS"
              ? [
                  "요구사항 분석 및 검토",
                  "기능·화면·데이터 설계",
                  "구현 및 통합 검증",
                  "산출물 검토 및 납품",
                ]
              : doc.kind === "아키텍처"
                ? [
                    "Next.js 사용자 화면과 서버 경계",
                    "Workflow와 일곱 Agent 구성요소",
                    "프로젝트 데이터 및 파일 저장소",
                  ]
                : doc.kind === "DB 설계서"
                  ? [
                      "프로젝트·멤버·권한 관계",
                      "문서와 요구사항의 불변 버전",
                      "요구사항과 기능의 다대다 연결",
                    ]
                  : doc.kind === "화면설계서"
                    ? [
                        "화면 ID: SCR-001 · 통합 검색",
                        "검색 입력 → 조건 검증 → 결과 목록",
                        "빈 목록, 권한 없음, 오류 상태 정의",
                      ]
                    : related.map((r) => `${r.code} · ${r.title}`)
            ).map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        )}
        <h4>3. 근거 요구사항</h4>
        <div className="flex flex-wrap gap-2">
          {related.map((r) => (
            <Link
              key={r.id}
              href={projectHref(doc.projectId, "requirements", { req: r.id })}
              className="badge badge-brand"
            >
              {r.code}
              <ArrowRight size={10} className="ml-1" />
            </Link>
          ))}
        </div>
        <p className="mt-5 !text-[10px] text-muted">
          확인 필요: 업무 예외 조건과 세부 정책은 담당자 검토 후 확정합니다.
        </p>
      </article>
    </Dialog>
  );
}
function GenerationPanel({ projectId }: { projectId: string }) {
  const [kind, setKind] = useState("기능 명세서");
  const [template, setTemplate] = useState("HAMS 표준 템플릿");
  const [sample, setSample] = useState("검토 대기");
  const [selected, setSelected] = useState(
    requirements
      .filter((r) => r.projectId === projectId && r.type === "기능")
      .map((r) => r.id),
  );
  const setDirty = useUI((s) => s.setDirty);
  useEffect(() => () => setDirty(false), [setDirty]);
  const reqs = requirements.filter((r) => r.projectId === projectId);
  const doc = projectDocuments(projectId).find((d) => d.kind === kind)!;
  const states = ["대기 중", "분석 중", "검토 대기", "완료 예시"];
  const active = states.indexOf(sample);
  return (
    <>
      <SourceNote />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card
          title="어떤 문서를 만들까요?"
          description="검토한 요구사항과 템플릿을 선택해 샘플 결과를 확인하세요."
        >
          <div className="space-y-5 px-5 pb-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field">
                산출물 종류
                <select
                  value={kind}
                  onChange={(e) => {
                    setKind(e.target.value);
                    setDirty(true);
                  }}
                >
                  {[
                    "기능 명세서",
                    "화면설계서",
                    "WBS",
                    "아키텍처",
                    "DB 설계서",
                  ].map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                문서 템플릿
                <select
                  value={template}
                  onChange={(e) => {
                    setTemplate(e.target.value);
                    setDirty(true);
                  }}
                >
                  <option>HAMS 표준 템플릿</option>
                  <option>고객사 기본 템플릿</option>
                </select>
              </label>
            </div>
            <fieldset>
              <legend className="mb-3 text-xs font-semibold">
                입력 요구사항{" "}
                <span className="ml-1 text-muted">
                  {selected.length}개 선택
                </span>
              </legend>
              <div className="space-y-2">
                {reqs.map((r) => (
                  <label
                    className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3"
                    key={r.id}
                  >
                    <input
                      className="mt-1 accent-brand"
                      type="checkbox"
                      checked={selected.includes(r.id)}
                      onChange={(e) => {
                        setSelected(
                          e.target.checked
                            ? [...selected, r.id]
                            : selected.filter((id) => id !== r.id),
                        );
                        setDirty(true);
                      }}
                    />
                    <span>
                      <span className="requirement-code">{r.code}</span>
                      <span className="ml-2 text-xs">{r.title}</span>
                      <span className="mt-1 block text-[10px] text-muted">
                        {r.source}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="text-[11px] leading-6 text-muted">
              선택 내용은 임시 입력입니다. 아래 버튼은 미리 준비된 {kind}를 열며
              선택 내용으로 새 문서를 생성하지 않습니다.
            </p>
            {selected.length ? (
              <Link
                className="button button-primary"
                href={projectHref(projectId, "artifacts", { doc: doc.id })}
              >
                <Sparkles size={14} />
                샘플 결과 보기
                <ArrowRight size={13} />
              </Link>
            ) : (
              <button disabled className="button button-primary">
                요구사항을 하나 이상 선택하세요
              </button>
            )}
          </div>
        </Card>
        <Card
          title="실행 흐름 미리보기"
          description="실제 실행이 아닌 상태별 예시입니다."
        >
          <div className="space-y-4 px-5 pb-5">
            <label className="field">
              실행 상태 샘플
              <select
                value={sample}
                onChange={(e) => setSample(e.target.value)}
              >
                {states.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <ol className="space-y-5 py-2">
              {[
                "입력·권한 검증",
                "문서 분석 및 초안 생성",
                "출처·연결 검증 / 사용자 검토",
                "검토된 버전 저장",
              ].map((text, index) => (
                <li key={text} className="flex items-center gap-3">
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] ${index <= active ? "bg-brand-soft text-brand" : "bg-background text-muted"}`}
                  >
                    {index < active ? <Check size={12} /> : index + 1}
                  </span>
                  <span className="text-[11px] leading-5">{text}</span>
                </li>
              ))}
            </ol>
            <div className="notice-banner">
              <Info size={14} />
              <p>
                실행 완료와 문서 승인은 별개입니다. 최종 확정 전 담당자의 검토가
                필요합니다.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

export function ProjectWorkspace({ projectId }: { projectId: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const notify = useUI((s) => s.notify);
  const project = projects.find((p) => p.id === projectId)!;
  const rawTab = params.get("tab");
  const tab: ProjectTab = projectTabs.includes(rawTab as ProjectTab)
    ? (rawTab as ProjectTab)
    : "overview";
  const docs = projectDocuments(projectId);
  const reqs = requirements.filter((r) => r.projectId === projectId);
  const q = params.get("q") || "";
  const type = params.get("type") || "";
  const kind = params.get("kind") || "";
  const req = reqs.find((r) => r.id === params.get("req"));
  const doc = docs.find((d) => d.id === params.get("doc"));
  const invalidDetail =
    (params.has("req") && !req) || (params.has("doc") && !doc);
  const projectChanges = changes.filter((c) => c.projectId === projectId);
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`/projects/${projectId}?${next}`, { scroll: false });
  };
  useEffect(() => {
    if (rawTab && !projectTabs.includes(rawTab as ProjectTab))
      router.replace(projectHref(projectId), { scroll: false });
  }, [rawTab, projectId, router]);
  return (
    <>
      <PageHeading
        eyebrow={`PROJECT WORKSPACE / ${project.client}`}
        title={project.name}
        description={project.description}
        actions={
          <>
            <Badge tone="brand">{project.stage}</Badge>
            <Link
              className="button"
              href={`/settings/project?projectId=${projectId}`}
            >
              <SlidersHorizontal size={14} />
              프로젝트설정
            </Link>
          </>
        }
      />
      <nav className="tabs" aria-label="프로젝트 작업 메뉴">
        {projectTabs.map((key) => (
          <Link
            key={key}
            href={projectHref(projectId, key)}
            className={`tab ${tab === key ? "active" : ""}`}
            aria-current={tab === key ? "page" : undefined}
          >
            {tabLabels[key]}
          </Link>
        ))}
      </nav>
      {invalidDetail && (
        <div className="notice-banner mb-5">
          <Info size={15} />
          <p>
            이 프로젝트에서 요청한 문서 또는 요구사항을 찾을 수 없습니다. 다른
            프로젝트의 항목은 표시하지 않습니다.
          </p>
          <button
            className="ml-auto text-link"
            onClick={() => router.replace(projectHref(projectId, tab))}
          >
            닫기
          </button>
        </div>
      )}
      {tab === "overview" && (
        <>
          <div className="mb-5 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "연결된 문서",
                value: docs.length,
                unit: "개",
                href: "artifacts",
              },
              {
                title: "구조화된 요구사항",
                value: reqs.length,
                unit: "개",
                href: "requirements",
              },
              {
                title: "검토 필요 문서",
                value: docs.filter((d) => d.status === "검토 필요").length,
                unit: "건",
                href: "changes",
              },
            ].map((item) => (
              <Link
                className="panel p-5"
                key={item.title}
                href={projectHref(projectId, item.href)}
              >
                <p className="text-xs text-muted">{item.title}</p>
                <p className="stat-number">
                  {item.value}
                  <span>{item.unit}</span>
                </p>
              </Link>
            ))}
          </div>
          <div className="mb-5 grid gap-5 lg:grid-cols-2">
            <Card
              title="다음 작업"
              description="프로젝트 문서를 같은 흐름으로 이어가세요."
            >
              <div className="space-y-3 px-5 pb-5">
                <Link
                  className="notice-banner !text-foreground"
                  href={projectHref(projectId, "requirements")}
                >
                  <Check size={16} />
                  <span>원문 근거와 요구사항 검토</span>
                  <ArrowRight size={14} className="ml-auto" />
                </Link>
                <Link
                  className="notice-banner !text-foreground"
                  href={projectHref(projectId, "generate")}
                >
                  <Sparkles size={16} />
                  <span>기능·화면·DB 명세 샘플 살펴보기</span>
                  <ArrowRight size={14} className="ml-auto" />
                </Link>
              </div>
            </Card>
            <Card
              title="최근 활동"
              description="샘플 데이터 기준의 프로젝트 변경 내역"
            >
              {projectChanges.map((change) => (
                <div className="activity-row" key={change.id}>
                  <span className="avatar">
                    <GitCompareArrows size={15} />
                  </span>
                  <div>
                    <p>{change.title}</p>
                    <small>
                      {change.updated} · REQ-002 · 영향 후보 2개 문서
                    </small>
                    <div className="mt-2">
                      <TextLink href={projectHref(projectId, "changes")}>
                        변경 영향 확인
                      </TextLink>
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
          <Card
            title="프로젝트 문서"
            action={
              <TextLink href={projectHref(projectId, "artifacts")}>
                산출물 보기
              </TextLink>
            }
          >
            <DocumentTable items={docs} />
          </Card>
        </>
      )}
      {tab === "rfp" && (
        <>
          <SourceNote />
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <Card
              title="프로젝트 제안요청서"
              description="원본 문서와 요구사항의 시작점"
            >
              <div className="px-5 pb-5">
                <div className="mb-5 flex items-center gap-3 rounded-lg border border-border p-4">
                  <DocumentIcon kind="RFP" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">
                      {docs[0].name}.pdf
                    </p>
                    <p className="mt-1 text-[10px] text-muted">
                      v1.0 · 샘플 RFP · 실제 파일 없음
                    </p>
                  </div>
                </div>
                <div className="prose-document">
                  <p className="!text-[10px] text-brand">
                    SOURCE DOCUMENT / SAMPLE
                  </p>
                  <h3>{project.name}</h3>
                  <p className="text-muted">
                    본 화면은 원문 파일을 대신하는 구조·근거 예시입니다.
                  </p>
                  <h4>1. 프로젝트 범위</h4>
                  <p>
                    {project.description}. 요구사항과 관련 기능을 연결하고 변경
                    내역과 검토 상태를 관리합니다.
                  </p>
                  <h4>2. 주요 요구사항</h4>
                  <ul className="space-y-2">
                    {reqs.map((r) => (
                      <li key={r.id}>
                        <Link
                          href={projectHref(projectId, "requirements", {
                            req: r.id,
                          })}
                          className="text-link !text-xs !text-foreground"
                        >
                          <span className="requirement-code">{r.code}</span>
                          {r.title}
                          <ArrowRight size={12} />
                        </Link>
                        <p className="!text-[10px] text-muted">{r.source}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
            <Card
              title="RFP에서 시작하기"
              description="요구사항 분석 전 입력 문서를 확인합니다."
            >
              <div className="space-y-4 px-5 pb-5">
                <div className="rounded-lg border border-dashed border-border p-7 text-center">
                  <FileUp size={27} className="mx-auto text-brand" />
                  <p className="mt-3 text-xs font-semibold">새 RFP 등록</p>
                  <p className="mt-2 text-[10px] leading-5 text-muted">
                    파일 업로드·파싱은
                    <br />
                    후속 연동에서 제공합니다.
                  </p>
                  <button
                    className="button button-small mt-4"
                    onClick={() =>
                      notify(
                        "실제 파일 업로드와 문서 파싱은 아직 연결되지 않았습니다. 왼쪽 샘플 RFP를 확인해 주세요.",
                      )
                    }
                  >
                    업로드 · 준비 중
                  </button>
                </div>
                <Link
                  className="button button-primary w-full"
                  href={projectHref(projectId, "requirements")}
                >
                  샘플 요구사항 보기
                  <ArrowRight size={13} />
                </Link>
              </div>
            </Card>
          </div>
        </>
      )}
      {tab === "requirements" && (
        <>
          <div className="toolbar">
            <SearchField
              value={q}
              onChange={(value) => update("q", value)}
              placeholder="요구사항 ID 또는 내용 검색"
            />
            <label className="sr-only" htmlFor="requirement-type">
              요구사항 유형 필터
            </label>
            <select
              id="requirement-type"
              className="select !w-auto"
              value={type}
              onChange={(e) => update("type", e.target.value)}
            >
              <option value="">전체 유형</option>
              <option>기능</option>
              <option>비기능</option>
            </select>
            {(q || type) && (
              <button
                className="button button-small"
                onClick={() => router.replace(projectHref(projectId, tab))}
              >
                필터 초기화
              </button>
            )}
            <Link
              className="button button-primary sm:ml-auto"
              href={projectHref(projectId, "generate")}
            >
              <Sparkles size={13} />
              문서 생성
            </Link>
          </div>
          <Card
            title="요구사항 목록"
            description="요구사항 ID를 선택해 원문 근거와 연결된 산출물을 확인하세요."
          >
            {reqs.filter(
              (r) =>
                (!type || r.type === type) &&
                (!q || `${r.code} ${r.title} ${r.description}`.includes(q)),
            ).length ? (
              <div className="table-wrap">
                <table className="data-table">
                  <caption className="sr-only">프로젝트 요구사항 목록</caption>
                  <thead>
                    <tr>
                      <th scope="col">요구사항 ID</th>
                      <th scope="col">요구사항</th>
                      <th scope="col">유형</th>
                      <th scope="col">연결 기능</th>
                      <th scope="col">검토 상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reqs
                      .filter(
                        (r) =>
                          (!type || r.type === type) &&
                          (!q ||
                            `${r.code} ${r.title} ${r.description}`.includes(
                              q,
                            )),
                      )
                      .map((r) => (
                        <tr key={r.id}>
                          <td>
                            <Link
                              className="requirement-code underline underline-offset-4"
                              href={projectHref(projectId, tab, { req: r.id })}
                            >
                              {r.code}
                            </Link>
                          </td>
                          <td>
                            <Link
                              className="document-name"
                              href={projectHref(projectId, tab, { req: r.id })}
                            >
                              {r.title}
                            </Link>
                            <p className="document-caption">{r.source}</p>
                          </td>
                          <td>
                            <Badge>{r.type}</Badge>
                          </td>
                          <td className="text-muted">{r.functionId}</td>
                          <td>
                            <Badge
                              tone={
                                r.status === "검토 필요" ? "warning" : "success"
                              }
                            >
                              {r.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="검색 결과가 없습니다"
                description="다른 검색어나 유형을 선택해 보세요."
                action={
                  <button
                    className="button"
                    onClick={() => router.replace(projectHref(projectId, tab))}
                  >
                    필터 초기화
                  </button>
                }
              />
            )}
          </Card>
        </>
      )}
      {tab === "generate" && (
        <GenerationPanel key={projectId} projectId={projectId} />
      )}
      {tab === "changes" && (
        <>
          <div className="notice-banner mb-5">
            <GitCompareArrows size={16} />
            <p>
              요구사항 변경에서 연결된 산출물까지 추적하는 샘플 관계입니다. AI가
              실제 변경 영향을 분석한 결과가 아닙니다.
            </p>
          </div>
          {projectChanges.map((change) => (
            <Card
              key={change.id}
              title={change.title}
              action={<Badge tone="warning">검토 필요</Badge>}
            >
              <div className="px-5 pb-5">
                <div className="mb-5 flex items-center gap-3 text-[11px] text-muted">
                  <Link
                    className="requirement-code underline"
                    href={projectHref(projectId, "requirements", {
                      req: change.requirementId,
                    })}
                  >
                    REQ-002
                  </Link>
                  <span>{change.updated}</span>
                  <span className="flex items-center gap-1">
                    <Clock3 size={12} />
                    변경 영향 검토 대기
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-background p-4">
                    <p className="mb-2 text-[10px] text-muted">변경 전</p>
                    <p className="text-xs leading-6">{change.before}</p>
                  </div>
                  <div className="rounded-lg bg-brand-soft p-4">
                    <p className="mb-2 text-[10px] text-brand">변경 후</p>
                    <p className="text-xs leading-6">{change.after}</p>
                  </div>
                </div>
                <h3 className="mb-3 mt-6 text-xs font-semibold">
                  영향을 받는 산출물 · 기능 FUNC-002
                </h3>
                <div className="space-y-2">
                  {change.documentIds.map((id) => {
                    const linkedDoc = docs.find((d) => d.id === id)!;
                    return (
                      <Link
                        key={id}
                        href={projectHref(projectId, "artifacts", { doc: id })}
                        className="flex items-center gap-3 rounded-lg border border-border p-4"
                      >
                        <DocumentIcon />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold">
                            {linkedDoc.name}
                          </p>
                          <p className="mt-1 text-[10px] text-muted">
                            REQ-002 → FUNC-002 · 반영 여부 확인 필요
                          </p>
                        </div>
                        <ArrowRight size={15} className="text-muted" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))}
        </>
      )}
      {tab === "artifacts" && (
        <>
          <div className="toolbar">
            <SearchField value={q} onChange={(value) => update("q", value)} />
            <label className="sr-only" htmlFor="artifact-kind">
              산출물 종류 필터
            </label>
            <select
              id="artifact-kind"
              className="select !w-auto"
              value={kind}
              onChange={(e) => update("kind", e.target.value)}
            >
              <option value="">전체 산출물</option>
              {[
                "기능 명세서",
                "화면설계서",
                "WBS",
                "아키텍처",
                "DB 설계서",
              ].map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
            {(q || kind) && (
              <button
                className="button button-small"
                onClick={() => router.replace(projectHref(projectId, tab))}
              >
                필터 초기화
              </button>
            )}
          </div>
          <Card
            title="프로젝트 산출물"
            description="문서 버전, 검토 상태, 근거 요구사항을 함께 확인합니다."
            action={<Badge>샘플 데이터</Badge>}
          >
            <DocumentTable
              items={docs.filter(
                (d) =>
                  d.kind !== "RFP" &&
                  (!kind || d.kind === kind) &&
                  (!q || d.name.includes(q)),
              )}
            />
          </Card>
        </>
      )}
      {req && (
        <RequirementDetail
          requirement={req}
          onClose={() => update("req", "")}
        />
      )}
      {!req && doc && (
        <DocumentPreview doc={doc} onClose={() => update("doc", "")} />
      )}
    </>
  );
}
