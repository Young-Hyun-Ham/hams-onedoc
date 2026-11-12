"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { projectHref, projects } from "@/lib/mock/fixtures";
import {
  DocumentIcon,
  EmptyState,
  StatusBadge,
} from "@/components/ui/primitives";
import type { ProjectDocument } from "@/lib/types/domain";

export function DocumentTable({
  items,
  showProject = false,
}: {
  items: ProjectDocument[];
  showProject?: boolean;
}) {
  if (!items.length)
    return (
      <EmptyState
        title="조건에 맞는 문서가 없습니다"
        description="검색어 또는 필터를 변경해 보세요."
      />
    );
  return (
    <div className="table-wrap">
      <table className="data-table">
        <caption className="sr-only">
          문서 목록: 문서명, 버전, 상태, 담당자, 수정일
        </caption>
        <thead>
          <tr>
            <th scope="col">문서명</th>
            <th scope="col">버전</th>
            <th scope="col">상태</th>
            <th scope="col">담당자</th>
            <th scope="col">최근 수정</th>
            <th scope="col">
              <span className="sr-only">열기</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((doc) => (
            <tr key={doc.id}>
              <td>
                <div className="document-cell">
                  <DocumentIcon kind={doc.kind} />
                  <div>
                    <Link
                      className="document-name"
                      href={projectHref(
                        doc.projectId,
                        doc.kind === "RFP" ? "rfp" : "artifacts",
                        { doc: doc.id },
                      )}
                    >
                      {doc.name}
                    </Link>
                    <p className="document-caption">
                      {showProject
                        ? projects.find((p) => p.id === doc.projectId)?.client +
                          " · "
                        : ""}
                      {doc.kind}
                    </p>
                  </div>
                </div>
              </td>
              <td className="text-muted">{doc.version}</td>
              <td>
                <StatusBadge status={doc.status} />
              </td>
              <td className="text-muted">{doc.owner}</td>
              <td className="text-muted">{doc.updated.replaceAll("-", ".")}</td>
              <td>
                <Link
                  className="icon-button text-muted"
                  href={projectHref(
                    doc.projectId,
                    doc.kind === "RFP" ? "rfp" : "artifacts",
                    { doc: doc.id },
                  )}
                  aria-label={`${doc.name} 열기`}
                >
                  <ChevronRight size={16} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
