"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Search,
  X,
  FolderOpen,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";
import type { DocumentStatus } from "@/lib/types/domain";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "brand" | "success" | "warning" | "blue";
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
export function StatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <Badge
      tone={
        status === "승인 완료"
          ? "success"
          : status === "검토 필요"
            ? "warning"
            : status === "검토 중"
              ? "blue"
              : "neutral"
      }
    >
      {status}
    </Badge>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
export function Card({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      {title && (
        <div className="panel-heading">
          <div>
            <h2>{title}</h2>
            {description && (
              <p className="mt-1 text-xs text-muted">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function TextLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className="text-link">
      {children}
      <ArrowRight size={14} aria-hidden="true" />
    </Link>
  );
}
export function SearchField({
  value,
  onChange,
  placeholder = "문서명으로 검색",
  label = "검색",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}) {
  return (
    <label className="search-field">
      <Search size={16} aria-hidden="true" />
      <span className="sr-only">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type="search"
      />
    </label>
  );
}
export function EmptyState({
  title,
  description,
  action,
  kind = "empty",
}: {
  title: string;
  description: string;
  action?: ReactNode;
  kind?: "empty" | "error" | "denied";
}) {
  const Icon =
    kind === "error"
      ? TriangleAlert
      : kind === "denied"
        ? ShieldAlert
        : FolderOpen;
  return (
    <div className="empty-state" role={kind === "error" ? "alert" : undefined}>
      <span className="empty-icon">
        <Icon size={25} aria-hidden="true" />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function Dialog({
  title,
  description,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    element?.showModal();
    return () => {
      element?.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`app-dialog ${wide ? "dialog-wide" : ""}`}
      aria-labelledby="dialog-title"
      aria-describedby={description ? "dialog-description" : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const rect = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
          )
            onClose();
        }
      }}
    >
      <div className="dialog-heading">
        <div>
          <h2 id="dialog-title">{title}</h2>
          {description && (
            <p
              id="dialog-description"
              className="mt-1 text-xs leading-5 text-muted"
            >
              {description}
            </p>
          )}
        </div>
        <button
          type="button"
          className="icon-button"
          aria-label="닫기"
          onClick={onClose}
        >
          <X size={19} />
        </button>
      </div>
      <div className="dialog-body">{children}</div>
    </dialog>
  );
}
export function DocumentIcon({ kind }: { kind?: string }) {
  return (
    <span
      className={`document-icon ${kind === "RFP" ? "document-icon-rose" : ""}`}
    >
      <FileText size={19} aria-hidden="true" />
    </span>
  );
}
export function LoadingState() {
  return (
    <div
      role="status"
      aria-label="화면을 불러오는 중"
      className="space-y-5 p-6"
    >
      <span className="sr-only">화면을 불러오는 중입니다.</span>
      <div className="skeleton h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((n) => (
          <div key={n} className="skeleton h-28" />
        ))}
      </div>
      <div className="skeleton h-80" />
    </div>
  );
}
