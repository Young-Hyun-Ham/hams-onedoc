"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import {
  Layers3,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  ChevronRight,
  FlaskConical,
  CircleHelp,
  PanelLeftClose,
} from "lucide-react";
import {
  useUI,
  useWorkspace,
  useConfirmNavigation,
} from "@/components/providers/app-store-provider";
import { navigation, tabLabels } from "@/lib/navigation";
import { projects } from "@/lib/mock/fixtures";
import { EmptyState, LoadingState } from "@/components/ui/primitives";

function Brand() {
  return (
    <Link href="/" className="brand" aria-label="HAMS onedoc 대시보드">
      <span className="brand-mark">
        <Layers3 size={23} strokeWidth={2.2} />
      </span>
      <span>
        <span className="brand-name">
          onedoc<span className="brand-dot">.</span>
        </span>
        <span className="brand-sub">by HAMS</span>
      </span>
    </Link>
  );
}
function SidebarContent({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  const notify = useUI((s) => s.notify);
  const close = useUI((s) => s.setMenuOpen);
  return (
    <>
      <div className="sidebar-logo">
        <Brand />
        {mobile && (
          <button
            className="icon-button"
            onClick={() => close(false)}
            aria-label="메뉴 닫기"
          >
            <PanelLeftClose size={20} />
          </button>
        )}
      </div>
      <div className="sidebar-content">
        <div className="workspace-label">
          <span className="workspace-avatar">H</span>
          <div>
            <strong>HAMS Workspace</strong>
            <span>프로젝트 문서 워크스페이스</span>
          </div>
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label={mobile ? "모바일 주요 메뉴" : "주요 메뉴"}>
          {navigation.map(({ href, label, icon: Icon }, i) => {
            const active =
              href === "/"
                ? pathname === "/" || pathname.startsWith("/projects/")
                : pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`nav-item ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{label}</span>
                {i === 0 && <span className="nav-active-dot" />}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-note">
          <span className="flex items-center gap-2 font-semibold">
            <Layers3 size={16} /> 흩어진 문서를 하나로
          </span>
          <p>
            요구사항에서 최종 산출물까지,
            <br />
            프로젝트의 맥락을 연결하세요.
          </p>
          <Link href="/projects/commerce?tab=overview">
            작업 공간 둘러보기 <ChevronRight size={13} />
          </Link>
        </div>
      </div>
      <div className="sidebar-bottom">
        <div className="user-row">
          <span className="avatar">서연</span>
          <div>
            <strong>김서연</strong>
            <span>프로젝트 관리자 · 샘플</span>
          </div>
        </div>
        <button
          type="button"
          className="logout-button"
          onClick={() => {
            close(false);
            notify("데모 화면에서는 실제 세션이 종료되지 않습니다.");
          }}
        >
          <LogOut size={17} />
          로그아웃
        </button>
      </div>
    </>
  );
}
function MobileNav() {
  const open = useUI((s) => s.menuOpen);
  const setOpen = useUI((s) => s.setMenuOpen);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    if (open) dialog?.showModal();
    else dialog?.close();
    if (!open) return;
    const query = window.matchMedia("(min-width: 1024px)");
    const onResize = () => {
      if (query.matches) setOpen(false);
    };
    query.addEventListener("change", onResize);
    return () => {
      query.removeEventListener("change", onResize);
      dialog?.close();
      if (previous?.isConnected) previous.focus();
    };
  }, [open, setOpen]);
  return (
    <dialog
      ref={ref}
      className="mobile-drawer"
      aria-label="주요 메뉴"
      onCancel={(e) => {
        e.preventDefault();
        setOpen(false);
      }}
      onClick={(e) => {
        if (
          e.target === e.currentTarget &&
          e.clientX > e.currentTarget.getBoundingClientRect().right
        )
          setOpen(false);
      }}
    >
      <div className="sidebar-inner">
        <SidebarContent mobile />
      </div>
    </dialog>
  );
}
function ThemeToggle() {
  const theme = useUI((s) => s.theme);
  const setTheme = useUI((s) => s.setTheme);
  const ready = useUI((s) => s.themeReady);
  return (
    <button
      type="button"
      className="theme-toggle"
      disabled={!ready}
      aria-label={theme === "light" ? "다크 모드로 전환" : "라이트 모드로 전환"}
      aria-pressed={theme === "dark"}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun size={16} className="light-icon" />
      <Moon size={16} className="dark-icon" />
      <span className="hidden sm:inline">
        {theme === "light" ? "라이트" : "다크"}
      </span>
    </button>
  );
}
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const setMenu = useUI((s) => s.setMenuOpen);
  const notice = useUI((s) => s.notice);
  const notify = useUI((s) => s.notify);
  const dirty = useUI((s) => s.dirty);
  const setProjectId = useWorkspace((s) => s.setProjectId);
  const confirmNavigation = useConfirmNavigation();
  const pathProjectId = pathname.startsWith("/projects/")
    ? pathname.split("/")[2]
    : null;
  const projectId = pathProjectId || params.get("projectId");
  const project = projects.find((p) => p.id === projectId);
  const route = navigation.find((item) => item.href === pathname);
  const tab = params.get("tab");
  const label =
    project && pathProjectId
      ? tabLabels[tab as keyof typeof tabLabels] || "개요"
      : route?.label || "프로젝트";
  const previewState =
    process.env.NODE_ENV === "development" ? params.get("previewState") : null;
  useEffect(() => {
    setMenu(false);
    setProjectId(project?.id || null);
  }, [pathname, params, setMenu, setProjectId, project?.id]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => notify(""), 6500);
    return () => clearTimeout(timer);
  }, [notice, notify]);
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  return (
    <div
      className="app-shell"
      onClickCapture={(e) => {
        if (!dirty || !(e.target instanceof Element)) return;
        const anchor = e.target.closest("a");
        if (
          !anchor ||
          anchor.target === "_blank" ||
          e.ctrlKey ||
          e.metaKey ||
          e.shiftKey ||
          e.altKey
        )
          return;
        if (anchor.href !== window.location.href && !confirmNavigation()) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <a href="#main-content" className="skip-link">
        본문으로 바로가기
      </a>
      <aside className="desktop-sidebar">
        <div className="sidebar-inner">
          <SidebarContent />
        </div>
      </aside>
      <MobileNav />
      <div className="right-column">
        <header className="app-header">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="icon-button mobile-menu-button"
              aria-label="메뉴 열기"
              aria-haspopup="dialog"
              onClick={() => setMenu(true)}
            >
              <Menu size={21} />
            </button>
            <nav aria-label="화면 경로" className="breadcrumbs">
              <Link href="/">워크스페이스</Link>
              <ChevronRight size={13} />
              <span className="hidden sm:contents">
                {project && pathProjectId && (
                  <>
                    <Link href={`/projects/${project.id}`}>{project.name}</Link>
                    <ChevronRight size={13} />
                  </>
                )}
              </span>
              <span aria-current="page">{label}</span>
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="header-demo">
              <FlaskConical size={13} />
              샘플 데이터
            </span>
            <span className="header-divider" />
            <ThemeToggle />
          </div>
        </header>
        <main id="main-content" className="main-content" tabIndex={-1}>
          {previewState === "loading" ? (
            <LoadingState />
          ) : previewState === "empty" ? (
            <EmptyState
              title="등록된 프로젝트가 없습니다"
              description="새 프로젝트에서 문서 관리를 시작해 보세요."
              action={
                <Link
                  className="button button-primary"
                  href="/projects/commerce"
                >
                  샘플 프로젝트 둘러보기
                </Link>
              }
            />
          ) : previewState === "error" ? (
            <EmptyState
              kind="error"
              title="화면을 불러오지 못했습니다"
              description="일시적인 오류 시안입니다. 다시 시도해 주세요."
              action={
                <button
                  className="button"
                  onClick={() => router.replace(pathname)}
                >
                  다시 시도
                </button>
              }
            />
          ) : previewState === "denied" ? (
            <EmptyState
              kind="denied"
              title="접근 권한이 없습니다"
              description="권한 없음 상태의 샘플 화면입니다."
              action={
                <Link className="button" href="/">
                  대시보드로 돌아가기
                </Link>
              }
            />
          ) : null}
          <div
            className="page-container"
            hidden={
              !!previewState &&
              ["loading", "empty", "error", "denied"].includes(previewState)
            }
          >
            {children}
          </div>
        </main>
        <footer className="app-footer">
          <span>
            © 2026 HAMS onedoc<span className="footer-separator">·</span>
            프로젝트의 맥락을 연결합니다.
          </span>
          <span className="flex items-center gap-2">
            <span className="status-dot" />
            퍼블리싱 프리뷰 <span className="footer-separator">v0.1.0</span>
            <button
              className="footer-help"
              aria-label="프리뷰 안내"
              onClick={() =>
                notify(
                  "1차 퍼블리싱 프리뷰입니다. 데이터는 샘플이며 DB 저장, AI 실행, 외부 공유는 연결되지 않았습니다.",
                )
              }
            >
              <CircleHelp size={14} />
            </button>
          </span>
        </footer>
      </div>
      {notice && (
        <div className="toast" role="status">
          <span>{notice}</span>
          <button
            className="icon-button"
            aria-label="알림 닫기"
            onClick={() => notify("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
