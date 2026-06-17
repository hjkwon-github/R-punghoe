# 아키텍처 개요

이 문서는 R-punghoe(알풍회) 위키의 전체 시스템 설계를 설명합니다. 세부 운영 절차는
[maintainer-runbook.md](./maintainer-runbook.md), 배포 세부 사항은 [deployment.md](./deployment.md),
콘텐츠 스키마는 [content-model.md](./content-model.md), 운영 정책은 [policy.md](./policy.md)를 참고하세요.

## 1. 목적과 범위

알풍회는 '알상무'의 **공개 활동·영상·발언·밈·자료 흔적**을 출처와 함께 정리하는 비공식 팬 아카이브
위키입니다. 이 프로젝트는 알상무 본인, 슈카친구들, 머니코믹스와 **공식 관계가 없습니다.**

이 위키가 하려는 일은 다음과 같습니다.

- 공개된 자료(유튜브, 기사, 공식 채널, 공개 인터뷰)에 한정해 기록을 정리합니다.
- 모든 기록에 **날짜·출처(URL)·타임스탬프·검증 상태**를 남겨 누구나 다시 확인할 수 있게 합니다.
- 검증 상태는 정확히 세 가지(`확인됨` / `검토중` / `보류`)로만 관리합니다.
- 팬덤 밈은 보존하되 맥락과 함께 차분하고 사실 위주로 기록합니다.

## 2. 비목표 (Non-goals)

설계 단계에서 의도적으로 **하지 않기로** 결정한 것들입니다. 이 목록은 향후 의사결정의 가드레일입니다.

- **백엔드 없음.** 데이터베이스, 서버 함수, Workers, D1, R2, KV 등 어떤 동적 백엔드도 두지 않습니다.
- **사용자 계정·로그인 없음.** 기여는 GitHub Issue/PR로만 받습니다.
- **사생활 수집 없음.** 가족·주소·연락처·사적 동선 등 비공개 개인정보는 다루지 않습니다.
- **무근거 추측·루머 없음.** 출처가 없는 주장은 본문에 편입하지 않습니다.
- **공격·비방 없음.** 특정 개인을 깎아내리거나 조롱 목적의 기록을 남기지 않습니다.
- **투자 권유 없음.** 매수/매도/보유 권유로 읽힐 수 있는 표현을 두지 않습니다.
- **과도한 저작물 복제 없음.** 영상 전체 전사나 원문 통째 복사는 하지 않고, 출처 링크로 대체합니다.

## 3. 시스템 구성도

전체 흐름은 "사람이 Markdown으로 기록을 쓰고, Git을 통해 검토·병합한 뒤, 정적 사이트로 빌드되어
CDN으로 배포된다"는 한 줄로 요약됩니다. 배포 단계는 Git PR → 리뷰 → 병합 → Astro/Starlight 빌드 →
Pagefind 인덱스 → `npx wrangler deploy` (Workers Static Assets) → 글로벌 CDN 엣지 → 방문자 순서로
이어집니다. 동적 처리 단계가 전혀 없다는 점이 핵심입니다.

```text
 ┌──────────────┐
 │  기여자      │  공개 출처를 확인하고 기록 작성
 │ (Contributor)│
 └──────┬───────┘
        │  ① Markdown 기록 작성 (날짜·출처·타임스탬프·검증 상태 포함)
        ▼
 ┌──────────────────────┐
 │  Git 브랜치 / Fork    │
 └──────┬───────────────┘
        │  ② GitHub Pull Request 생성
        ▼
 ┌──────────────────────┐      검증 상태 확인 · 출처 확인
 │  리뷰 (Maintainer)    │ ◀─── 금지 항목(사생활/루머/투자권유) 점검
 └──────┬───────────────┘
        │  ③ 승인 후 main 브랜치에 병합 (Merge)
        ▼
 ┌──────────────────────────────────────────────┐
 │  빌드 파이프라인 (Workers 빌드 파이프라인)      │
 │                                                │
 │   Astro + Starlight  ──▶  HTML/CSS/JS 정적 생성 │
 │            │                                   │
 │            ▼                                   │
 │   Pagefind  ──▶  클라이언트 검색 인덱스 생성    │
 │            │                                   │
 │            ▼                                   │
 │   sitemap-index.xml / sitemap-0.xml 생성        │
 │   public/_headers (보안 헤더) 그대로 복사       │
 │            │                                   │
 │            ▼                                   │
 │   npx wrangler deploy (Workers Static Assets)   │
 └──────┬─────────────────────────────────────────┘
        │  ④ dist/ 정적 산출물
        ▼
 ┌──────────────────────────────┐      ┌──────────────────┐
 │  Cloudflare Workers           │ ───▶ │  글로벌 CDN 엣지  │ ──▶ 방문자
 │  (Static Assets / 정적 자산)  │      │  (캐시·HTTPS)     │
 └──────────────────────────────┘      └──────────────────┘
```

이 파이프라인에는 런타임 서버가 없습니다. 빌드 시점에 모든 페이지·검색 인덱스·사이트맵이 미리
생성되고, 이후에는 CDN이 정적 파일만 제공합니다.

## 4. 기술 스택 선택 근거

### 왜 정적(Static-only)인가

- **신뢰성과 투명성.** 모든 변경은 Git 히스토리에 남고, 누구나 동일한 입력으로 동일한 사이트를
  재현(reproducible build)할 수 있습니다. 아카이브 프로젝트의 핵심 가치인 "다시 확인 가능함"과
  맞닿아 있습니다.
- **운영 부담 최소화.** 데이터베이스·서버가 없으므로 패치·장애·보안 사고 표면이 작고, 유지보수
  비용이 거의 들지 않습니다.
- **공격 표면 축소.** 서버 측 입력 처리가 없어 인젝션·인증 우회 같은 위험이 구조적으로 사라집니다.

### 왜 Astro + Starlight인가

- Starlight는 문서/위키 사이트에 특화된 Astro 공식 프레임워크로, 사이드바·검색·다국어·반응형·
  접근성이 기본 제공됩니다. 위키 본문은 단순 Markdown/MDX로 작성하므로 기여 장벽이 낮습니다.
- 콘텐츠 컬렉션 스키마(`src/content.config.ts`)로 프런트매터를 검증할 수 있어, 날짜·출처·검증
  상태 같은 필수 메타데이터를 구조적으로 강제하기에 적합합니다.
- 빌드 산출물이 순수 정적 파일이라 어떤 정적 호스트에도 올릴 수 있어 종속성이 낮습니다.

### 왜 Pagefind인가

- Starlight에 기본 내장된 클라이언트 사이드 전문 검색 엔진입니다. **서버가 필요 없습니다.**
- 빌드 시 색인을 생성하고, 방문자 브라우저에서 WebAssembly로 동작합니다. 검색 트래픽이 서버로
  가지 않으므로 정적 전용 원칙을 그대로 지킬 수 있습니다.
- 한국어를 포함한 다국어 색인을 지원하며, 추가 설정 없이 활성화됩니다.

### 왜 Cloudflare Workers (Static Assets)인가

- 정적 사이트 호스팅에 대한 Cloudflare의 **현재 권장 경로**입니다. 기존 Pages에서 마이그레이션하기에
  명확한 이전 대상이며, `npx wrangler deploy` 한 번으로 정적 산출물(`dist/`)을 그대로 배포합니다.
- 글로벌 CDN, 무료 HTTPS, `_headers`/`_redirects` 네이티브 지원을 정적 사이트만으로 모두 제공합니다.
  별도의 백엔드(Worker 스크립트)가 필요 없습니다.
- 무료 등급으로 팬 프로젝트 규모를 충분히 감당하며, 데이터베이스·서버 함수 같은 동적 기능 없이도
  완결됩니다.

## 5. 최종 레포 디렉터리 트리

설계가 반영된 목표 디렉터리 구조입니다. (일부 파일은 다른 워크스트림에서 작성 중입니다.)

```text
R-punghoe/
├── astro.config.mjs              # 사이트 설정, Starlight 통합, 사이드바
├── package.json                  # 의존성·스크립트 (astro, @astrojs/starlight, sharp)
├── tsconfig.json
├── wrangler.jsonc                # Workers Static Assets 배포 설정 (assets.directory: ./dist, not_found_handling)
├── README.md                     # 프로젝트 소개·빠른 시작·문서 색인
├── LICENSE                       # 코드 라이선스 (권장: MIT)
├── LICENSE-CONTENT.md            # 콘텐츠 라이선스 (권장: CC BY-SA 4.0)
├── CONTRIBUTING.md               # 기여 가이드
│
├── public/                       # 그대로 dist/로 복사되는 정적 자산
│   ├── _headers                  # Workers Static Assets 보안/캐시 헤더
│   ├── favicon.svg
│   └── robots.txt
│
├── docs/                         # 설계·운영 문서 (사이트에는 빌드되지 않음)
│   ├── README.md                 # 이 폴더의 색인
│   ├── architecture.md           # 본 문서: 시스템 설계 개요
│   ├── roadmap.md                # 단계별 로드맵
│   ├── maintainer-runbook.md     # 메인테이너 운영 절차
│   ├── content-model.md          # 프런트매터/기록 스키마 (별도 워크스트림)
│   ├── deployment.md             # 배포·롤백 절차 (별도 워크스트림)
│   └── policy.md                 # 운영·정정·삭제 정책 (별도 워크스트림)
│
├── .github/
│   ├── ISSUE_TEMPLATE/           # 기록 제안·정정 요청 등 이슈 템플릿
│   │   ├── new-record.md
│   │   └── correction-request.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/                # CI (링크 검사·스키마 검증 등, Phase 3)
│
└── src/
    ├── content.config.ts         # Starlight docs 컬렉션 + 프런트매터 스키마
    └── content/
        └── docs/                 # 실제 위키 콘텐츠 (빌드 대상)
            ├── index.mdx         # 홈
            ├── about.md          # 소개
            ├── principles.md     # 기록 원칙
            ├── contributing.md   # 기여 방법
            └── archive/
                ├── timeline.md   # 연대기
                ├── sources.md    # 출처 모음
                ├── glossary.md   # 용어사전
                └── records/      # 개별 기록 (1기록 = 1파일)
```

> `docs/` 폴더는 설계·운영 문서 보관용이며, Starlight는 `src/content/docs/`만 사이트로 빌드합니다.
> 둘은 경로가 비슷하지만 역할이 다릅니다.

## 6. 검색, 사이트맵, 보안 헤더는 어디서 오는가

### 검색 (Pagefind)

검색은 Starlight에 기본 내장된 **Pagefind**가 담당합니다. 별도 통합을 설치하거나 설정할 필요가
없으며, `npm run build` 시 생성된 HTML을 스캔해 검색 색인을 만들어 `dist/`에 함께 출력합니다.
방문자가 검색창에 입력하면 서버 호출 없이 브라우저에서 색인을 조회하므로, 정적 전용 구조를
유지하면서도 전문 검색을 제공합니다. 검색 품질은 결국 각 기록의 제목·요약·태그 같은 본문 내용에
달려 있으므로, 기록 작성 규칙([content-model.md](./content-model.md))이 곧 검색 품질을 좌우합니다.

### 사이트맵 (Sitemap)

사이트맵은 Starlight가 `astro.config.mjs`의 최상위 `site` 키를 보고 **자동 생성**합니다. 빌드 시
`dist/`에 `sitemap-index.xml`과 `sitemap-0.xml`이 만들어지고, 모든 페이지 `<head>`에 사이트맵 링크가
추가됩니다. 별도 라이브러리를 추가할 필요가 없으며, `site` 키만 올바르게 유지하면 됩니다. Workers
배포의 기본 URL은 `*.pages.dev`가 아니라 `<name>.<account>.workers.dev` 형식이므로, `site`에는 실제로
배포된 오리진(workers.dev 주소 또는 연결한 커스텀 도메인)을 설정해야 합니다.

### 보안 헤더 (Security Headers)

보안 헤더는 `public/_headers` 파일에서 옵니다. `public/`의 파일은 빌드 시 `dist/`로 그대로 복사되고,
Cloudflare Workers Static Assets가 이 `_headers` 파일을 읽어 응답 헤더로 적용합니다. `_headers`/
`_redirects`는 Workers Static Assets가 네이티브로 지원하며, 별도의 Worker 스크립트가 없으므로 모든
정적 응답에 그대로 적용됩니다. 여기에는 CSP
(Content-Security-Policy), HSTS, `X-Content-Type-Options`, `Referrer-Policy`, 프레임 보호 등이
포함됩니다. **주의:** Pagefind는 WebAssembly로 동작하므로 CSP의 `script-src`에 `'wasm-unsafe-eval'`을
허용해야 검색이 깨지지 않습니다. 헤더의 구체적 값과 검증 절차는 [deployment.md](./deployment.md)에서
관리합니다.
