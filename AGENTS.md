<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->

## HAMS onedoc 프로젝트 지침

최종 갱신: 2026-11-12 (Asia/Seoul)

- 현재 범위는 1차 퍼블리싱이다. 데이터는 `lib/mock/fixtures.ts`의 샘플이며 인증·Turso·파일 저장·LLM·외부 공유는 후속 연동 대상이다. 이번 구현의 DB 변경은 없다.
- Next.js / React / TypeScript, Tailwind CSS + lucide-react, Provider 단위 Zustand Store를 사용한다. 기존 MUI·에디터·DB 의존성을 임의 삭제하지 않는다.
- 루트 `app/layout.tsx`는 Server Component로 유지한다. 업무 페이지는 `app/(workspace)/`에서 같은 셸을 공유한다.
- URL의 프로젝트 ID·탭·상세 항목이 기준이다. 다른 프로젝트의 요구사항·문서를 상세로 표시하지 않는다.
- 테마만 브라우저 저장소에 보관한다. 설정·문서 생성 옵션은 임시 입력이며 내부 이동 전 폐기를 확인한다.
- 실제 미구현 기능에 저장·생성 성공 메시지를 사용하지 않는다. 샘플 데이터·준비 중 상태를 명시한다.
- 모바일 메뉴·모달은 네이티브 dialog를 사용하며 닫기·Escape·포커스 복원을 유지한다. 라이트·다크 대비와 반응형을 검증한다.
- 변경 후 `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build` 및 관련 화면 동작을 확인한다. 브라우저 검증은 README의 `scripts/verify-ui.mjs` 실행 방법을 따른다.
- 민감정보를 소스·문서·로그에 남기지 않는다. 사용자 요청 범위 밖의 DB·다른 hams 프로젝트는 변경하지 않는다.
- 최신 설계와 사용자의 수정 내용을 구현 전에 다시 읽는다. 작업 이력에는 변경 파일·DB 변경 여부·검증·미완료 사항을 한국시간 날짜로 기록한다.

참고: [README](README.md), [설계 기준](docs/history/2026-11-12/AI-Agent-아키텍처-및-통합문서관리-퍼블리싱-설계.md), [작업 기록](docs/work/2026-11-12/통합문서관리-1차-퍼블리싱.md), [작업 이력](WORK_HISTORY.md).

