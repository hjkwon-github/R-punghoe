# R-punghoe (알풍회)

알풍회는 알상무의 공개 활동, 영상, 발언, 밈, 자료 흔적을 출처와 함께 정리하는 **비공식 팬 아카이브
위키**입니다.

> **비공식 고지.** 이 프로젝트는 팬 프로젝트이며 알상무 본인, 슈카친구들, 머니코믹스와 **공식 관계가
> 없습니다.** 모든 기록은 공개된 자료를 기준으로 남기며, 사생활 수집이나 무근거 추측은 다루지
> 않습니다.

## 방향

- 공개 영상, 기사, 방송 설명, 공식 채널 링크 중심으로 기록합니다.
- 각 항목은 **날짜·출처(URL)·타임스탬프·검증 상태**를 함께 남깁니다.
- 검증 상태는 정확히 세 가지입니다: `확인됨` / `검토중` / `보류`.
- 투자 조언처럼 보이는 표현을 피하고, 기록과 맥락 설명에 집중합니다.
- 팬덤 밈은 보존하되 특정 개인을 공격하거나 사생활을 추적하지 않습니다.

## 기술 스택

이 위키는 **정적 전용(static-only)** 구조입니다. 데이터베이스·서버 함수·백엔드는 두지 않으며,
기여는 GitHub Issue/PR로만 받습니다. 자세한 근거는 [docs/architecture.md](./docs/architecture.md)에
있습니다.

- [Astro](https://astro.build/) — 정적 사이트 프레임워크
- [Starlight](https://starlight.astro.build/) — 문서/위키 테마 (검색·사이드바·사이트맵 기본 제공)
- [Pagefind](https://pagefind.app/) — 클라이언트 사이드 검색 (Starlight 내장, 서버 불필요)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/) — 정적 호스팅 + 글로벌 CDN

## 빠른 시작

### 로컬 개발

```bash
npm install
npm run dev
```

개발 서버는 기본적으로 `http://localhost:4321`에서 실행됩니다.

### 빌드 / 미리보기

```bash
npm run build
npm run preview
```

빌드 결과물은 `dist/`에 생성되며, Pagefind 검색 색인과 사이트맵(`sitemap-index.xml`)이 함께
만들어집니다.

### 배포

Cloudflare Pages에 GitHub 저장소를 연결하면 `main` 병합 시 자동 빌드·배포됩니다. 빌드 설정과
보안 헤더(`public/_headers`), 롤백 절차는 [docs/deployment.md](./docs/deployment.md)를 참고하세요.

## 문서 구조

### 사이트 콘텐츠 (`src/content/docs/`)

```text
src/content/docs/
  index.mdx                홈
  about.md                 프로젝트 소개
  principles.md            기록 원칙
  contributing.md          기여 방법
  archive/timeline.md      연대기
  archive/glossary.md      용어사전
  archive/records/         개별 기록 (1기록 = 1파일)
```

### 설계 · 운영 문서 (`docs/`)

| 문서 | 설명 |
| --- | --- |
| [docs/README.md](./docs/README.md) | 문서 폴더 색인 |
| [docs/architecture.md](./docs/architecture.md) | 시스템 설계 개요 (구성도·스택 근거·디렉터리 트리) |
| [docs/content-model.md](./docs/content-model.md) | 기록 프런트매터/태그 스키마 |
| [docs/deployment.md](./docs/deployment.md) | 배포·롤백, Cloudflare Pages, 보안 헤더 |
| [docs/policy.md](./docs/policy.md) | 운영 정책, 금지 항목, 정정·삭제 처리 |
| [docs/roadmap.md](./docs/roadmap.md) | 단계별 로드맵 (Phase 0~4) |
| [docs/maintainer-runbook.md](./docs/maintainer-runbook.md) | 메인테이너 일상 운영 절차 |

## 기여 안내

기여는 **GitHub Issue/PR로만** 받습니다. 시작 전 [CONTRIBUTING.md](./CONTRIBUTING.md)와
[docs/content-model.md](./docs/content-model.md)를 읽어 주세요. 새 기록 제안·정정 요청은 GitHub
이슈 템플릿(`.github/ISSUE_TEMPLATE/`)을 사용합니다.

기록 1건은 파일 1개로 작성합니다. 프런트매터 필드는 다음과 같습니다(전체 설명은
[docs/content-model.md](./docs/content-model.md), 채워진 예시는
[example-record.md](./src/content/docs/archive/records/example-record.md)).

```md
---
title: 기록 제목
description: 한 줄 설명
recordDate: 2024-09-01       # YYYY-MM-DD (사건/발언 날짜)
verification: 검토중          # 확인됨 / 검토중 / 보류
recordTags: [영상, 발언]      # 분류 태그 (문자열 배열)
sources:                     # 공개 출처 (객체 배열)
  - title: 출처 제목/채널
    url: https://...
    timestamp: "12:34"       # 영상이라면 해당 시점
---

본문에는 사실 요약과 맥락을 적습니다.
```

### 금지 항목

- 비공개 개인정보 (가족·주소·연락처·사적 동선)
- 출처 없는 루머·추측
- 특정 개인 비방·조롱·공격성 표현
- 투자 매수/매도/보유 권유
- 영상 전체 전사 또는 과도한 저작물 복제

## 라이선스

- **코드:** [MIT](./LICENSE) (권장안)
- **콘텐츠(문서·기록):** [CC BY-SA 4.0](./LICENSE-CONTENT.md) (권장안)

콘텐츠를 재사용할 때는 출처(이 위키)를 밝히고 동일 조건으로 공유해 주세요. 라이선스 파일은 공개
기여를 받기 전 최종 확정합니다.

## 원칙 요약

이 위키는 **정적 전용**이며, **공개 출처만**, **메타데이터 4종(날짜·출처·타임스탬프·검증 상태)과
함께**, **차분하고 사실 위주로** 기록합니다. 더 자세한 원칙은 사이트의 [기록 원칙](./src/content/docs/principles.md)
페이지에 있습니다.
