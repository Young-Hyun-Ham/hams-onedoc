# HAMS onedoc

요구사항부터 설계, 변경 이력, 최종 산출물까지 연결하는 프로젝트 문서 통합관리 서비스입니다.

현재 구현은 **1차 퍼블리싱 프리뷰**입니다. React / Next.js App Router / TypeScript, Zustand, Tailwind CSS와 lucide-react를 사용합니다. 화면의 프로젝트·문서·요구사항·멤버는 연결 관계를 가진 샘플 데이터입니다.

## 실행

Node.js 22 이상과 pnpm 10을 사용합니다. 이 작업의 검증 환경은 Node.js 24.12.0 / pnpm 10.27.0입니다.

```sh
pnpm install
pnpm dev
```

기본 주소는 http://localhost:3000 입니다. 외부 폰트 다운로드 없이 시스템 한글 폰트를 사용합니다.

```sh
pnpm lint
pnpm exec tsc --noEmit
pnpm build
pnpm start
```

## 화면

| 주소                  | 내용                                                          |
| --------------------- | ------------------------------------------------------------- |
| `/`                   | 프로젝트 선택, 요약, 문서 생성 흐름, 최근 산출물·변경 영향    |
| `/team`               | 공유 문서 검색, 프로젝트·상태 필터, 문서 미리보기             |
| `/settings/profile`   | 프로필·기본 템플릿 임시 입력, 라이트·다크 테마                |
| `/settings/project`   | 편집할 프로젝트 직접 선택 후 기본 정보·ID 규칙·멤버 역할 시안 |
| `/settings/admin`     | 일곱 Agent 구성요소, 정책, 실행·감사 로그, 역할 시안          |
| `/projects/commerce`  | 커머스 프로젝트 작업 공간                                     |
| `/projects/workspace` | 업무 포털 프로젝트 작업 공간                                  |
| `/projects/care`      | 케어 서비스 프로젝트 작업 공간                                |

프로젝트 탭은 `?tab=overview|rfp|requirements|generate|changes|artifacts`로 탐색합니다. `req`, `doc` 검색 매개변수로 상세를 직접 열 수 있으며 다른 프로젝트의 항목은 표시하지 않습니다. 프로젝트설정은 `?projectId=commerce`처럼 편집 대상을 지정합니다.

로고와 헤더는 높이 64px로 정렬합니다. 1024px 미만에서는 좌측 메뉴가 드로어로 전환됩니다. 푸터는 우측 열 하단에 두고 모바일에서는 콘텐츠 뒤에 배치합니다.

## 상태와 저장 범위

- Zustand Store는 Provider 단위로 생성합니다. UI 상태와 현재 프로젝트 문맥을 분리합니다.
- 테마만 `hams-onedoc-theme` 키로 브라우저에 저장합니다. 저장소 접근이 차단되어도 테마 전환이 동작합니다.
- 검색·탭·프로젝트 문맥은 URL을 기준으로 복원합니다. 샘플 업무 데이터의 원장은 `lib/mock/fixtures.ts`입니다.
- 프로필·프로젝트 설정과 문서 생성 옵션은 임시 입력입니다. 내부 링크·프로젝트 선택으로 이동할 때 변경 폐기를 확인하고, 창 닫기·새로고침은 브라우저 기본 경고를 사용합니다.
- 실제 로그인·로그아웃, 권한 부여, 파일 업로드·파싱·다운로드, DB 저장, LLM 실행, 외부 공유는 연결되지 않았습니다. 해당 액션에는 데모/준비 중 안내가 있습니다.
- Turso 클라이언트는 기존 의존성에만 등록되어 있습니다. 이번 구현에는 DB 연결·스키마·마이그레이션·환경 변수 설정이 필요하지 않습니다.

## 구조

```text
app/                     # 서버 루트 + 공통 셸을 공유하는 (workspace) 라우트
components/layout/       # 사이드바, 헤더, 모바일 드로어, 푸터, 이동 경고
components/providers/    # 요청/마운트 단위 Store 생성
components/ui/           # 카드, 배지, 접근 가능한 모달, 상태 화면
components/dashboard/    # 대시보드
components/project/      # 프로젝트 탭, 요구사항·문서 상세, 문서 목록
components/team/         # 팀공유
components/settings/     # 개인·프로젝트·관리자 설정
stores/                  # UI 및 프로젝트 문맥 Store
lib/mock/                # 연결된 샘플 데이터
lib/types/               # 도메인 타입
scripts/verify-ui.mjs     # 로컬 Chrome 기반 브라우저 검증
```

루트 대시보드는 `app/(workspace)/page.tsx`에 두어 다른 화면과 셸을 공유합니다. 같은 `/` 페이지를 중복 생성하지 않습니다. `app/layout.tsx`는 Server Component로 유지하며 최초 페인트 전에 테마를 적용합니다.

## 브라우저 검증과 화면 자료

로컬 Chrome과 Node.js 기본 WebSocket을 사용하며 추가 브라우저 패키지를 설치하지 않습니다. 별도 터미널에서 다음 서버를 실행한 뒤 검증합니다.

```sh
pnpm dev --hostname 127.0.0.1 --port 3100
node scripts/verify-ui.mjs
```

기본 Chrome 경로는 Windows의 `C:/Program Files/Google/Chrome/Application/chrome.exe`입니다. 다른 환경은 `CHROME_PATH`, `UI_BASE_URL`, `UI_CDP_PORT` 환경 변수를 지정할 수 있습니다. 검증 서버 주소는 localhost/127.0.0.1로 제한합니다. 브라우저 프로필과 검증 JSON은 Git 제외 경로 `.local/`에 둡니다.

검증은 화면 이동·URL 복원·프로젝트 범위·필터·미저장 경고·테마 재접속·저장소 실패·대비·반응형·키보드 포커스를 확인하고 화면 캡처를 작업 기록 폴더에 저장합니다. 개발 모드에서만 `/?previewState=loading|empty|error|denied`로 공통 상태 시안을 확인할 수 있습니다. 일반 업무 UI에 개발용 상태 전환 도구를 노출하지 않습니다.

## 문서

- [설계 문서 이력](HISTORY.md)
- [구현 작업 이력](WORK_HISTORY.md)
- [기준 설계](docs/history/2026-11-12/AI-Agent-아키텍처-및-통합문서관리-퍼블리싱-설계.md)
- [1차 퍼블리싱 작업 기록](docs/work/2026-11-12/통합문서관리-1차-퍼블리싱.md)

후속 구현은 인증·권한·Turso와 파일 저장소 연동, 이후 Agent 실행 순서로 진행합니다. 세부 범위와 미결정 사항은 최신 설계 문서를 다시 읽고 확정합니다.
