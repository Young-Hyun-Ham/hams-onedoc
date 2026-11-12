"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Share2, UsersRound, Info } from "lucide-react";
import {
  PageHeading,
  Badge,
  Card,
  SearchField,
  EmptyState,
} from "@/components/ui/primitives";
import { DocumentTable } from "@/components/project/document-table";
import { projects, documents, members } from "@/lib/mock/fixtures";
import { useUI } from "@/components/providers/app-store-provider";

export function TeamPage() {
  const params = useSearchParams();
  const router = useRouter();
  const notify = useUI((s) => s.notify);
  const q = params.get("q") || "";
  const project = params.get("projectId") || "";
  const status = params.get("status") || "";
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`/team?${next}`, { scroll: false });
  };
  const items = documents.filter(
    (doc) =>
      (!project || doc.projectId === project) &&
      (!status || doc.status === status) &&
      (!q || `${doc.name} ${doc.owner}`.includes(q)),
  );
  return (
    <>
      <PageHeading
        eyebrow="BETTER TOGETHER"
        title="팀공유"
        description="함께 쓰는 문서, 같은 맥락으로 이어지는 협업."
        actions={
          <button
            className="button button-primary"
            onClick={() =>
              notify(
                "멤버 초대와 외부 공유는 후속 데이터 연동 단계에서 제공됩니다.",
              )
            }
          >
            <Share2 size={14} />
            공유 관리
          </button>
        }
      />
      <div className="mb-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Card
          title="우리 팀 워크스페이스"
          description="프로젝트와 문서를 함께 관리하는 팀"
        >
          <div className="flex flex-wrap items-center gap-4 px-5 pb-5">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-soft text-brand">
              <UsersRound size={23} />
            </span>
            <div>
              <p className="text-sm font-semibold">HAMS 프로젝트 팀</p>
              <p className="mt-1 text-[11px] text-muted">
                {projects.length}개 프로젝트 · 샘플 멤버 {members.length}명
              </p>
            </div>
            <div className="ml-auto flex -space-x-2">
              {members.map((m) => (
                <span
                  className="avatar"
                  key={m.name}
                  title={`${m.name} · ${m.role}`}
                >
                  {m.initials}
                </span>
              ))}
            </div>
          </div>
        </Card>
        <div className="notice-banner">
          <Info size={16} />
          <div>
            <strong className="text-foreground">공유 권한 안내</strong>
            <p className="mt-1">
              현재는 샘플 화면입니다. 표시된 역할은 실제 접근 권한을 부여하지
              않습니다.
            </p>
          </div>
        </div>
      </div>
      <div className="toolbar">
        <SearchField
          value={q}
          onChange={(v) => update("q", v)}
          placeholder="문서명 또는 담당자 검색"
        />
        <label className="sr-only" htmlFor="team-project">
          공유 프로젝트 필터
        </label>
        <select
          id="team-project"
          className="select !w-auto !max-w-full"
          value={project}
          onChange={(e) => update("projectId", e.target.value)}
        >
          <option value="">전체 프로젝트</option>
          {projects.map((p) => (
            <option value={p.id} key={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor="team-status">
          공유 문서 상태 필터
        </label>
        <select
          id="team-status"
          className="select !w-auto"
          value={status}
          onChange={(e) => update("status", e.target.value)}
        >
          <option value="">전체 상태</option>
          {["검토 필요", "검토 중", "승인 완료", "초안"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        {(q || project || status) && (
          <button
            className="button button-small"
            onClick={() => router.replace("/team")}
          >
            필터 초기화
          </button>
        )}
      </div>
      <Card title="공유된 문서" action={<Badge>{items.length}개 문서</Badge>}>
        {items.length ? (
          <DocumentTable items={items} showProject />
        ) : (
          <EmptyState
            title="검색 결과가 없습니다"
            description="검색어 또는 필터를 변경해 보세요."
            action={
              <button
                className="button"
                onClick={() => router.replace("/team")}
              >
                필터 초기화
              </button>
            }
          />
        )}
      </Card>
    </>
  );
}
