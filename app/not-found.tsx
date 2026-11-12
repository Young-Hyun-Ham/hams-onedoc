import Link from "next/link";
import { EmptyState } from "@/components/ui/primitives";
export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center p-6">
      <EmptyState
        title="페이지를 찾을 수 없습니다"
        description="프로젝트 또는 페이지 주소를 확인해 주세요."
        action={
          <Link className="button button-primary" href="/">
            대시보드로 돌아가기
          </Link>
        }
      />
    </div>
  );
}
