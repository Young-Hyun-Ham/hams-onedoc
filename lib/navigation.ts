import {
  LayoutDashboard,
  UsersRound,
  UserRound,
  FolderCog,
  ShieldCheck,
} from "lucide-react";
export const navigation = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/team", label: "팀공유", icon: UsersRound },
  { href: "/settings/profile", label: "개인설정", icon: UserRound },
  { href: "/settings/project", label: "프로젝트설정", icon: FolderCog },
  { href: "/settings/admin", label: "관리자설정", icon: ShieldCheck },
];
export const tabLabels = {
  overview: "개요",
  rfp: "RFP",
  requirements: "요구사항",
  generate: "문서 생성",
  changes: "변경 영향",
  artifacts: "산출물",
} as const;
