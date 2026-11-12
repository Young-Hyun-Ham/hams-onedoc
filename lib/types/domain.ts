export type DocumentKind =
  | "RFP"
  | "기능 명세서"
  | "화면설계서"
  | "WBS"
  | "아키텍처"
  | "DB 설계서";
export type DocumentStatus = "검토 필요" | "검토 중" | "승인 완료" | "초안";
export type Project = {
  id: string;
  name: string;
  client: string;
  description: string;
  initials: string;
  color: string;
  stage: string;
  members: number;
};
export type ProjectDocument = {
  id: string;
  projectId: string;
  name: string;
  kind: DocumentKind;
  version: string;
  status: DocumentStatus;
  owner: string;
  updated: string;
  requirementIds: string[];
};
export type Requirement = {
  id: string;
  projectId: string;
  code: string;
  title: string;
  description: string;
  type: "기능" | "비기능";
  source: string;
  functionId: string;
  status: "확인 완료" | "검토 필요";
};
export const projectTabs = [
  "overview",
  "rfp",
  "requirements",
  "generate",
  "changes",
  "artifacts",
] as const;
export type ProjectTab = (typeof projectTabs)[number];
