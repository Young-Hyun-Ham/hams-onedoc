"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Info,
  Moon,
  Sun,
  RotateCcw,
  UserRound,
  UsersRound,
  ShieldCheck,
  ArrowRight,
  Workflow,
  Check,
} from "lucide-react";
import {
  useUI,
  useConfirmNavigation,
} from "@/components/providers/app-store-provider";
import {
  Badge,
  Card,
  Dialog,
  EmptyState,
  PageHeading,
} from "@/components/ui/primitives";
import { agentComponents, members, projects } from "@/lib/mock/fixtures";
import type { Project } from "@/lib/types/domain";

function useUnsavedChanges(dirty: boolean) {
  const setDirty = useUI((s) => s.setDirty);
  useEffect(() => {
    setDirty(dirty);
    return () => setDirty(false);
  }, [dirty, setDirty]);
}
function DemoSettingsNote() {
  return (
    <div className="notice-banner mb-6">
      <Info size={15} />
      <p>
        테마를 제외한 설정은 현재 화면에서만 유지되는 임시 입력입니다. DB 및
        실제 권한에는 반영되지 않습니다.
      </p>
    </div>
  );
}
function FormActions({ dirty, reset }: { dirty: boolean; reset: () => void }) {
  const notify = useUI((s) => s.notify);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
      <p className="text-[10px] text-muted">
        {dirty
          ? "저장되지 않은 임시 변경사항이 있습니다."
          : "현재 샘플 기본값을 표시하고 있습니다."}
      </p>
      <div className="flex gap-2">
        <button type="button" className="button" onClick={reset}>
          <RotateCcw size={13} />
          초기화
        </button>
        <button
          type="button"
          className="button button-primary"
          onClick={() =>
            notify(
              "임시 입력을 확인했습니다. DB 저장은 연결되지 않아 화면을 떠나면 변경사항이 사라집니다.",
            )
          }
        >
          <Check size={13} />
          임시 입력 확인
        </button>
      </div>
    </div>
  );
}
export function ProfileSettings() {
  const [name, setName] = useState("김서연");
  const [template, setTemplate] = useState("HAMS 표준 템플릿");
  const dirty = name !== "김서연" || template !== "HAMS 표준 템플릿";
  useUnsavedChanges(dirty);
  const theme = useUI((s) => s.theme);
  const setTheme = useUI((s) => s.setTheme);
  const ready = useUI((s) => s.themeReady);
  return (
    <>
      <PageHeading
        eyebrow="PERSONAL PREFERENCES"
        title="개인설정"
        description="나에게 맞는 화면과 문서 작성 기본값을 설정하세요."
      />
      <DemoSettingsNote />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <Card
            title="프로필"
            description="팀에서 표시되는 내 정보를 확인합니다."
          >
            <div className="space-y-5 px-5 pb-5">
              <div className="flex items-center gap-3 border-b border-border pb-5">
                <span className="avatar !h-12 !w-12 !text-sm">
                  <UserRound size={23} />
                </span>
                <div>
                  <p className="text-sm font-semibold">김서연</p>
                  <p className="mt-1 text-[10px] text-muted">
                    HAMS 프로젝트 팀 · 샘플 계정
                  </p>
                </div>
                <span className="ml-auto">
                  <Badge tone="brand">프로젝트 관리자</Badge>
                </span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="field">
                  표시 이름
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={40}
                  />
                  <small>이름 변경은 현재 화면에서만 확인할 수 있습니다.</small>
                </label>
                <label className="field">
                  이메일
                  <input value="seoyeon@example.com" readOnly />
                  <small>샘플 주소이며 실제 계정 정보가 아닙니다.</small>
                </label>
              </div>
              <label className="field">
                기본 문서 템플릿
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                >
                  <option>HAMS 표준 템플릿</option>
                  <option>고객사 기본 템플릿</option>
                </select>
                <small>
                  실제 문서 생성 시 프로젝트 규칙이 먼저 적용됩니다.
                </small>
              </label>
              <FormActions
                dirty={dirty}
                reset={() => {
                  setName("김서연");
                  setTemplate("HAMS 표준 템플릿");
                }}
              />
            </div>
          </Card>
          <Card
            title="화면 테마"
            description="테마는 이 브라우저에 저장됩니다."
          >
            <fieldset className="grid gap-3 px-5 pb-5 sm:grid-cols-2">
              <legend className="sr-only">라이트 또는 다크 모드 선택</legend>
              {(["light", "dark"] as const).map((value) => (
                <button
                  type="button"
                  disabled={!ready}
                  key={value}
                  className={`flex items-center gap-3 rounded-lg border p-5 text-left ${theme === value ? "border-brand bg-brand-soft" : "border-border"}`}
                  aria-pressed={theme === value}
                  onClick={() => setTheme(value)}
                >
                  {value === "light" ? <Sun size={22} /> : <Moon size={22} />}
                  <span>
                    <strong className="block text-xs">
                      {value === "light" ? "라이트 모드" : "다크 모드"}
                    </strong>
                    <span className="mt-1 block text-[10px] text-muted">
                      {value === "light"
                        ? "밝고 선명한 작업 공간"
                        : "차분하고 편안한 작업 공간"}
                    </span>
                  </span>
                  {theme === value && (
                    <Check size={15} className="ml-auto text-brand" />
                  )}
                </button>
              ))}
            </fieldset>
          </Card>
        </div>
        <Card title="선호와 Memory" description="앞으로 적용할 설정 관리 방향">
          <div className="space-y-4 px-5 pb-5 text-[11px] leading-7 text-muted">
            <p>
              기본 템플릿 같은 사용자 선호와 현재 작업의 문맥을 분리하여
              관리합니다.
            </p>
            <p>
              장기 선호 저장과 기기 간 동기화는 후속 인증·데이터 연동 이후에
              제공합니다.
            </p>
            <div className="notice-banner">
              <ShieldCheck size={15} />
              <p>
                개인 선호는 프로젝트의 보안 정책이나 접근 권한을 변경하지
                않습니다.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
function ProjectSettingsForm({ project }: { project: Project }) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [prefix, setPrefix] = useState("REQ");
  const [template, setTemplate] = useState("HAMS 표준 템플릿");
  const [roles, setRoles] = useState(members.map((m) => m.role));
  const dirty =
    name !== project.name ||
    description !== project.description ||
    prefix !== "REQ" ||
    template !== "HAMS 표준 템플릿" ||
    roles.some((role, i) => role !== members[i].role);
  useUnsavedChanges(dirty);
  return (
    <div className="space-y-6">
      <Card
        title="프로젝트 기본 정보"
        description="선택한 프로젝트의 설정 시안입니다."
      >
        <div className="space-y-5 px-5 pb-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="field">
              프로젝트명
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
              />
            </label>
            <label className="field">
              고객사
              <input value={project.client} readOnly />
            </label>
          </div>
          <label className="field">
            프로젝트 설명
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="field">
              요구사항 ID 접두사
              <input
                value={prefix}
                onChange={(e) =>
                  setPrefix(
                    e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z]/g, "")
                      .slice(0, 8),
                  )
                }
              />
              <small>
                표시 예시: {prefix || "REQ"}-001 · 실제 ID 발급은 서버에서
                수행합니다.
              </small>
            </label>
            <label className="field">
              프로젝트 문서 템플릿
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
              >
                <option>HAMS 표준 템플릿</option>
                <option>고객사 기본 템플릿</option>
              </select>
            </label>
          </div>
        </div>
      </Card>
      <Card
        title="멤버와 역할"
        description="샘플 권한 편집이며 실제 접근 제어에는 반영되지 않습니다."
      >
        <div className="table-wrap">
          <table className="data-table">
            <caption className="sr-only">프로젝트 멤버와 임시 역할</caption>
            <thead>
              <tr>
                <th scope="col">멤버</th>
                <th scope="col">이메일 · 샘플</th>
                <th scope="col">역할</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={m.name}>
                  <td>
                    <span className="inline-flex items-center gap-2">
                      <span className="avatar">{m.initials}</span>
                      {m.name}
                    </span>
                  </td>
                  <td className="text-muted">{m.email}</td>
                  <td>
                    <label className="sr-only" htmlFor={`role-${i}`}>
                      {m.name} 역할
                    </label>
                    <select
                      id={`role-${i}`}
                      className="select !w-auto"
                      value={roles[i]}
                      onChange={(e) =>
                        setRoles(
                          roles.map((role, index) =>
                            index === i ? e.target.value : role,
                          ),
                        )
                      }
                    >
                      {["프로젝트 관리자", "편집자", "조회자"].map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <FormActions
        dirty={dirty}
        reset={() => {
          setName(project.name);
          setDescription(project.description);
          setPrefix("REQ");
          setTemplate("HAMS 표준 템플릿");
          setRoles(members.map((m) => m.role));
        }}
      />
    </div>
  );
}
export function ProjectSettings() {
  const params = useSearchParams();
  const router = useRouter();
  const confirm = useConfirmNavigation();
  const selected = params.get("projectId") || "";
  const project = projects.find((p) => p.id === selected);
  return (
    <>
      <PageHeading
        eyebrow="PROJECT CONFIGURATION"
        title="프로젝트설정"
        description="프로젝트 규칙과 문서 표준, 함께하는 멤버를 관리합니다."
      />
      <DemoSettingsNote />
      <div className="mb-6 max-w-md">
        <label className="field">
          설정할 프로젝트
          <select
            value={selected}
            onChange={(e) => {
              if (confirm())
                router.push(
                  e.target.value
                    ? `/settings/project?projectId=${e.target.value}`
                    : "/settings/project",
                );
            }}
          >
            <option value="">프로젝트를 선택해 주세요</option>
            {projects.map((p) => (
              <option value={p.id} key={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      {project ? (
        <ProjectSettingsForm key={project.id} project={project} />
      ) : (
        <Card>
          <EmptyState
            title={
              selected
                ? "프로젝트를 찾을 수 없습니다"
                : "프로젝트를 먼저 선택해 주세요"
            }
            description="의도하지 않은 프로젝트가 변경되지 않도록 편집 대상을 직접 선택합니다."
          />
        </Card>
      )}
    </>
  );
}
export function AdminSettings() {
  const [view, setView] = useState("agent");
  const [detail, setDetail] = useState<(typeof agentComponents)[number] | null>(
    null,
  );
  return (
    <>
      <PageHeading
        eyebrow="ADMINISTRATION"
        title="관리자설정"
        description="Agent 구성과 정책, 실행 이력을 한곳에서 확인하세요."
        actions={<Badge tone="warning">관리자 화면 시안</Badge>}
      />
      <div className="notice-banner mb-6">
        <ShieldCheck size={16} />
        <p>
          샘플 관리 화면입니다. 실제 사용자 권한이나 서버 정책을 변경하지
          않으며, 운영 관리자에게 고객 문서 접근 권한을 자동 부여하지 않습니다.
        </p>
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Workflow, label: "Agent 핵심 구성", value: "7개" },
          {
            icon: UsersRound,
            label: "샘플 멤버",
            value: `${members.length}명`,
          },
          { icon: ShieldCheck, label: "실행 통제", value: "전 · 중 · 후" },
        ].map(({ icon: Icon, label, value }) => (
          <div className="panel flex items-center gap-4 p-5" key={label}>
            <span className="stat-icon">
              <Icon size={18} />
            </span>
            <div>
              <p className="text-[10px] text-muted">{label}</p>
              <p className="mt-2 text-lg font-semibold">{value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="tabs" role="group" aria-label="관리자 화면 선택">
        {[
          ["agent", "Agent 구성"],
          ["policies", "정책·검증"],
          ["logs", "실행·감사 로그"],
          ["members", "사용자·역할"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`tab ${view === key ? "active" : ""}`}
            aria-pressed={view === key}
            onClick={() => setView(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {view === "agent" && (
        <Card
          title="AI Agent 핵심 구성요소"
          description="상세를 선택해 각 구성요소의 책임을 확인하세요."
        >
          <div className="table-wrap">
            <table className="data-table">
              <caption className="sr-only">
                Agent 일곱 구성요소와 샘플 버전
              </caption>
              <thead>
                <tr>
                  <th scope="col">구성요소</th>
                  <th scope="col">역할</th>
                  <th scope="col">버전 예시</th>
                  <th scope="col">상태</th>
                  <th scope="col">상세</th>
                </tr>
              </thead>
              <tbody>
                {agentComponents.map((item) => (
                  <tr key={item.name}>
                    <td className="font-semibold">{item.name}</td>
                    <td className="text-muted">{item.label}</td>
                    <td>{item.version}</td>
                    <td>
                      <Badge>연동 예정</Badge>
                    </td>
                    <td>
                      <button
                        className="text-link"
                        aria-label={`${item.name} 상세 보기`}
                        onClick={() => setDetail(item)}
                      >
                        상세 보기
                        <ArrowRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {view === "policies" && (
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            [
              "실행 전",
              "인증·프로젝트 권한",
              "입력 형식·크기 검증",
              "개인정보 전송 범위",
            ],
            [
              "실행 중",
              "허용 Tool과 인자 검증",
              "문서 내부 지시 격리",
              "시간·토큰·비용 한도",
            ],
            [
              "실행 후",
              "출처와 ID 관계 검증",
              "사용자 검토·버전 충돌",
              "저장 권한·감사 기록",
            ],
          ].map(([title, ...items]) => (
            <Card key={title} title={title} description="Guardrail 정책 설계안">
              <ul className="space-y-4 px-5 pb-5">
                {items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs">
                    <Check size={14} className="text-brand" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
      {view === "logs" && (
        <Card
          title="실행·감사 로그 예시"
          description="샘플 이벤트이며 실제 실행·감사 데이터가 아닙니다."
        >
          <div className="table-wrap">
            <table className="data-table">
              <caption className="sr-only">샘플 실행과 감사 이벤트</caption>
              <thead>
                <tr>
                  <th scope="col">구분</th>
                  <th scope="col">작업</th>
                  <th scope="col">대상</th>
                  <th scope="col">결과 예시</th>
                  <th scope="col">날짜</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "Agent",
                    "기능 명세 초안",
                    "커머스 플랫폼 고도화",
                    "사용자 검토 대기",
                  ],
                  [
                    "Guardrail",
                    "출처·관계 검증",
                    "REQ-002 / FUNC-002",
                    "재검토 필요",
                  ],
                  ["감사", "문서 버전 조회", "기능 명세서 v1.2", "조회 예시"],
                ].map(([type, action, target, result]) => (
                  <tr key={type}>
                    <td>
                      <Badge>{type}</Badge>
                    </td>
                    <td>{action}</td>
                    <td className="text-muted">{target}</td>
                    <td>{result}</td>
                    <td className="text-muted">2026.11.12</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      {view === "members" && (
        <Card
          title="사용자·역할"
          description="권한은 서버 연동 후 각 API에서 검증합니다."
        >
          {members.map((m) => (
            <div key={m.name} className="activity-row items-center">
              <span className="avatar">{m.initials}</span>
              <div className="flex-1">
                <p>{m.name}</p>
                <small>{m.email}</small>
              </div>
              <Badge>{m.role}</Badge>
            </div>
          ))}
          <p className="px-5 py-4 text-[11px] text-muted">
            조직 관리자와 플랫폼 운영 관리자는 별도 역할로 설계합니다.
          </p>
        </Card>
      )}
      {detail && (
        <Dialog
          title={`${detail.name} · ${detail.label}`}
          description={`샘플 버전 ${detail.version} · 후속 구현 설계`}
          onClose={() => setDetail(null)}
        >
          <p className="text-sm leading-8">{detail.detail}</p>
          <div className="notice-banner mt-5">
            <Info size={15} />
            <p>
              현재 화면은 구성과 책임을 설명하는 시안입니다. 실제 Agent 실행
              설정은 연결되지 않았습니다.
            </p>
          </div>
        </Dialog>
      )}
    </>
  );
}
