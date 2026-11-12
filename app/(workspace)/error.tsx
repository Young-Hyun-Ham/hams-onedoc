"use client";
import { EmptyState } from "@/components/ui/primitives";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <EmptyState
      kind="error"
      title="화면을 불러오지 못했습니다"
      description="일시적인 문제가 발생했습니다. 다시 시도해 주세요."
      action={
        <button className="button" onClick={reset}>
          다시 시도
        </button>
      }
    />
  );
}
