import type {
  DocumentKind,
  DocumentStatus,
  Project,
  ProjectDocument,
  Requirement,
} from "@/lib/types/domain";

export const projects: Project[] = [
  {
    id: "commerce",
    name: "커머스 플랫폼 고도화",
    client: "한빛커머스",
    description: "구매부터 배송까지, 고객 경험을 잇는 통합 플랫폼",
    initials: "CO",
    color: "rose",
    stage: "설계서 작성",
    members: 5,
  },
  {
    id: "workspace",
    name: "스마트 업무 포털",
    client: "HAMS",
    description: "팀의 정보와 업무를 하나로 연결하는 워크스페이스",
    initials: "WO",
    color: "blue",
    stage: "요구사항 분석",
    members: 4,
  },
  {
    id: "care",
    name: "디지털 케어 서비스",
    client: "온유헬스",
    description: "일상의 건강 데이터를 관리하는 개인 맞춤 서비스",
    initials: "CA",
    color: "violet",
    stage: "산출물 검토",
    members: 3,
  },
];

const kinds: DocumentKind[] = [
  "RFP",
  "기능 명세서",
  "화면설계서",
  "WBS",
  "아키텍처",
  "DB 설계서",
];
const statuses: DocumentStatus[] = [
  "승인 완료",
  "검토 필요",
  "검토 중",
  "승인 완료",
  "초안",
  "검토 필요",
];
const titles = [
  "사용자 인증 및 권한 관리",
  "통합 검색",
  "알림 수신 설정",
  "변경 이력 조회",
  "응답 속도 보장",
  "개인정보 접근 통제",
];

export const requirements: Requirement[] = projects.flatMap((project) =>
  titles.map((title, index) => ({
    id: `${project.id}-req-${index + 1}`,
    projectId: project.id,
    code: `REQ-${String(index + 1).padStart(3, "0")}`,
    title,
    description: `${project.name}에서 ${title} 기능과 정책을 제공한다. 세부 업무 규칙과 예외 처리는 담당자 검토 후 확정한다.`,
    type: index < 4 ? "기능" : "비기능",
    source: `제안요청서 v1.0 · ${index + 4}쪽 · ${index + 1}.1절`,
    functionId: `FUNC-${String(index + 1).padStart(3, "0")}`,
    status: index === 1 ? "검토 필요" : "확인 완료",
  })),
);

export const documents: ProjectDocument[] = projects.flatMap(
  (project, projectIndex) =>
    kinds.map((kind, index) => ({
      id: `${project.id}-doc-${index + 1}`,
      projectId: project.id,
      name:
        kind === "RFP"
          ? `${project.name} 제안요청서`
          : `${project.name} ${kind}`,
      kind,
      version: index === 1 ? "v1.2" : "v1.0",
      status: statuses[(index + projectIndex) % statuses.length],
      owner: ["김서연", "이준호", "박지민"][index % 3],
      updated: `2026-11-${String(12 - index).padStart(2, "0")}`,
      requirementIds: requirements
        .filter((r) => r.projectId === project.id)
        .map((r) => r.id),
    })),
);

export const changes = projects.map((project) => ({
  id: `${project.id}-change-1`,
  projectId: project.id,
  requirementId: `${project.id}-req-2`,
  title: "통합 검색 범위에 첨부 문서 추가",
  before: "프로젝트 이름과 문서 제목을 검색합니다.",
  after: "문서 제목뿐 아니라 첨부 문서의 내용까지 검색 범위를 확장합니다.",
  documentIds: [`${project.id}-doc-2`, `${project.id}-doc-3`],
  updated: "2026-11-12",
}));

export const members = [
  {
    name: "김서연",
    initials: "서연",
    role: "프로젝트 관리자",
    email: "seoyeon@example.com",
  },
  {
    name: "이준호",
    initials: "준호",
    role: "편집자",
    email: "junho@example.com",
  },
  {
    name: "박지민",
    initials: "지민",
    role: "조회자",
    email: "jimin@example.com",
  },
];
export const agentComponents = [
  {
    name: "Prompt",
    label: "역할과 출력 규칙",
    version: "v1.0",
    detail: "요구사항 분석 전문가 · 근거와 확인 필요 사항을 포함한 구조화 출력",
  },
  {
    name: "Knowledge",
    label: "프로젝트 지식",
    version: "v1.0",
    detail:
      "프로젝트 표준, 문서 템플릿, 원문 위치와 버전. 실제 검색은 후속 연동합니다.",
  },
  {
    name: "Skill",
    label: "전문 작업 절차",
    version: "v1.0",
    detail:
      "requirement-analysis / functional-specification / change-impact-analysis",
  },
  {
    name: "Tool",
    label: "실제 기능 실행",
    version: "v1.0",
    detail:
      "파싱, 검색, ID 발급, 문서 저장. 서버에서 허용 목록과 권한을 검증합니다.",
  },
  {
    name: "Memory",
    label: "작업 문맥과 선호",
    version: "v1.0",
    detail: "단기 작업 상태와 명시적으로 저장한 장기 선호를 분리합니다.",
  },
  {
    name: "Workflow",
    label: "실행 순서와 복구",
    version: "v1.0",
    detail:
      "분석 → 검증 → 사용자 검토 → 저장. 실행 상태와 문서 승인은 분리합니다.",
  },
  {
    name: "Guardrail",
    label: "보안과 출력 검증",
    version: "v1.0",
    detail:
      "실행 전·중·후 권한, 개인정보, ID 관계, 근거와 사용량 한도를 검증합니다.",
  },
];

export function projectHref(
  projectId: string,
  tab = "overview",
  extra?: Record<string, string>,
) {
  return `/projects/${encodeURIComponent(projectId)}?${new URLSearchParams({ tab, ...extra }).toString()}`;
}
export function projectDocuments(projectId?: string) {
  return documents.filter((d) => !projectId || d.projectId === projectId);
}
