# 로드맵

이 문서는 R-punghoe(알풍회) 위키의 단계별 발전 계획입니다. 각 단계는 구체적인 산출물(deliverable)과
"완료 기준"을 함께 정의합니다. 모든 단계는 [architecture.md](./architecture.md)에서 정한 **정적 전용
(static-only)** 전제를 벗어나지 않습니다.

전체 원칙은 한 줄로 유지됩니다. **공개 출처만, 메타데이터 4종(날짜·출처·타임스탬프·검증 상태)과
함께, 차분하고 사실 위주로.**

## Phase 0 — 현재 상태 (Baseline)

지금 저장소에 이미 존재하는 것들입니다.

- Astro `^6.4.5` + `@astrojs/starlight` `^0.40.0` + `sharp` 의존성 구성.
- `astro.config.mjs`: 사이트 주소·제목·GitHub 소셜 링크·사이드바 2개 그룹(`시작하기`, `기록실`).
- 기본 콘텐츠: `index.mdx`, `about.md`, `principles.md`, `contributing.md`,
  `archive/timeline.md`, `archive/glossary.md`.
- `content.config.ts`: 표준 Starlight docs 컬렉션(docsLoader + docsSchema).
- `wrangler.jsonc`: Workers Static Assets 배포 설정(`assets.directory: ./dist`).
- README에 프로젝트 방향·비공식 고지가 기록됨. 라이선스는 미확정.

**상태:** 골격은 섰지만, 기록 형식·배포 안전장치·운영 절차가 아직 문서화되지 않은 단계.

## Phase 1 — 구조 · 스키마 · 배포 확립 (이번 설계)

이 위키가 "운영 가능한 상태"가 되도록 토대를 마련하는 단계입니다.

**산출물**

- 설계 문서 세트: `docs/architecture.md`, `docs/roadmap.md`, `docs/maintainer-runbook.md`,
  `docs/content-model.md`, `docs/deployment.md`, `docs/policy.md`, `docs/README.md`.
- 콘텐츠 모델 확정: 기록 1건 = 파일 1개, 프런트매터 필수 필드(날짜·출처·타임스탬프·검증 상태)와
  태그 체계 정의 → [content-model.md](./content-model.md).
- 배포 파이프라인 문서화: Cloudflare Workers(Static Assets) 빌드/배포 설정, `public/_headers`(CSP 포함), 롤백 절차 →
  [deployment.md](./deployment.md).
- 운영 정책 문서화: 금지 항목, 정정·삭제 요청 처리, 검증 상태 전환 기준 → [policy.md](./policy.md).
- 기여 경로 확정: `CONTRIBUTING.md`, GitHub 이슈/PR 템플릿.
- 라이선스 결정: 코드 = MIT, 콘텐츠 = CC BY-SA 4.0 (권장안 채택).

**완료 기준**

- 새 기여자가 문서만 읽고 첫 기록 PR을 형식에 맞게 만들 수 있다.
- main에 병합하면 Cloudflare Workers(Static Assets)가 자동 빌드·배포하고, 보안 헤더와 검색이 정상 동작한다.

## Phase 2 — 기록 채우기 · 태그/검색 정착 · 정정 프로세스 가동

토대 위에 실제 콘텐츠를 쌓고, 운영 사이클을 돌리기 시작하는 단계입니다.

**산출물**

- 초기 기록 작성: `src/content/docs/archive/records/` 아래 검증된 기록을 축적. 각 기록은 연대기
  (`timeline.md`)와 교차 연결.
- 태그 체계 적용: 영상/발언/밈/기사 등 분류 태그를 일관되게 부착해 탐색성과 Pagefind 검색 품질 향상.
- 용어사전(`glossary.md`) 확충: 밈·표현·약어를 출처와 함께 정리.
- 정정 프로세스 가동: 이슈로 들어온 정정/삭제 요청을 [policy.md](./policy.md) 기준으로 처리하고,
  처리 이력을 투명하게 남김.
- 검증 상태 운영: `검토중` 항목을 출처 확인 후 `확인됨`으로, 근거 부족 시 `보류`로 전환.

**완료 기준**

- 대표 주제군에 검증된 기록이 충분히 쌓여 위키로서 의미 있는 탐색 경험을 제공한다.
- 정정/삭제 요청이 정해진 절차로 일관되게 처리된다.

## Phase 3 — 자동화 (CI · 스키마 검증 · 온보딩)

사람이 일일이 확인하던 점검을 자동화해 품질을 기계적으로 보장하는 단계입니다. **모든 자동화는
빌드/CI 단계에서만 동작하며, 런타임 서버를 도입하지 않습니다.**

**산출물**

- 죽은 링크 검사 CI: PR과 정기 스케줄에서 출처 URL의 유효성을 검사하는 GitHub Actions 워크플로.
- 프런트매터 스키마 검증: 빌드 시 `content.config.ts` 스키마로 필수 필드(날짜·출처·타임스탬프·
  검증 상태 enum)를 강제하고, CI에서 누락/오타를 차단.
- 검증 상태 enum 강제: `확인됨`/`검토중`/`보류` 외의 값을 빌드 실패로 처리.
- 기여자 온보딩 자동화: PR 템플릿 체크리스트, 신규 기여자 안내 자동 코멘트(GitHub Actions),
  `good first issue` 라벨 정비.
- 정기 점검 잡: 오래된 `검토중` 항목과 죽은 링크를 주기적으로 이슈로 보고.

**완료 기준**

- 형식·출처에 문제가 있는 PR은 사람이 보기 전에 CI가 먼저 걸러낸다.
- 죽은 링크와 방치된 `검토중` 항목이 자동으로 가시화된다.

## Phase 4 — 확장 아이디어 (정적 유지 전제, 동적은 보류/future)

장기적으로 고려할 수 있는 확장입니다. **여기 적힌 것은 모두 "정적 전용 원칙을 지킨다는 전제"에서만
검토하며, 동적 기능은 채택하지 않고 future 아이디어로만 남깁니다.**

**정적 범위에서 검토 가능한 것**

- 연대기/태그 기반의 정적 인덱스 페이지를 빌드 시 자동 생성.
- 영어 등 추가 언어 번역(Starlight i18n, 정적).
- 기록 간 교차 참조·관계도(빌드 시 생성되는 정적 그래프 페이지).
- RSS/Atom 피드(정적 생성)로 최신 기록 구독 제공.
- 접근성·성능 개선(이미지 최적화, Lighthouse 점검 CI).

**보류 (future only — 현재 채택하지 않음)**

다음 항목들은 정적 전용 원칙과 충돌하므로 **도입하지 않습니다.** 기록 차원에서만 남겨 둡니다.

- 데이터베이스(D1 등) 기반 동적 검색/필터 — _보류._
- 서버 함수·Workers·API 엔드포인트 — _보류._
- 객체 스토리지(R2)·KV 등 상태 저장소 — _보류._
- 로그인/계정 기반 기여 시스템 — _보류._ 기여는 계속 GitHub Issue/PR로만 받습니다.

> 이 단계의 어떤 항목도 "정적 전용" 결정을 번복하지 않습니다. 동적 기능이 꼭 필요하다는 판단이
> 서면, 그때 별도의 설계 논의를 거쳐 [architecture.md](./architecture.md)의 결정을 명시적으로
> 갱신해야 합니다.
