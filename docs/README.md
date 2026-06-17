# 설계 · 운영 문서 (docs/)

이 폴더는 R-punghoe(알풍회) 위키의 **설계·운영 문서**를 모아 둔 곳입니다. 사이트로 빌드되는
콘텐츠는 `src/content/docs/`에 있고, 이 `docs/` 폴더는 메인테이너와 기여자를 위한 내부 문서입니다.

전체 대전제는 [architecture.md](./architecture.md)에 정의된 **정적 전용(static-only)** 구조입니다.
백엔드·데이터베이스·서버 함수는 두지 않으며, 기여는 GitHub Issue/PR로만 받습니다.

## 문서 목록

| 문서 | 설명 |
| --- | --- |
| [architecture.md](./architecture.md) | 시스템 설계 개요 — 목적·비목표, 구성도, 기술 스택 선택 근거, 디렉터리 트리, 검색/사이트맵/보안 헤더 |
| [content-model.md](./content-model.md) | 기록 콘텐츠 모델 — 프런트매터 필수 필드(날짜·출처·타임스탬프·검증 상태)와 태그 스키마 _(별도 워크스트림)_ |
| [deployment.md](./deployment.md) | 배포·롤백 절차 — Cloudflare Workers(Static Assets) 빌드·배포 설정, `public/_headers`(CSP) _(별도 워크스트림)_ |
| [policy.md](./policy.md) | 운영 정책 — 금지 항목, 정정·삭제 요청 처리, 검증 상태 기준 _(별도 워크스트림)_ |
| [roadmap.md](./roadmap.md) | 단계별 로드맵 — Phase 0~4, 각 단계 산출물과 완료 기준 |
| [maintainer-runbook.md](./maintainer-runbook.md) | 메인테이너 운영 가이드 — 새 기록 추가, PR 리뷰 체크리스트, 검증 상태 전환, 정기 점검 |

## 어디서부터 읽을까

- **처음 오셨다면:** [architecture.md](./architecture.md) → [roadmap.md](./roadmap.md) 순서로 큰
  그림을 잡으세요.
- **기록을 추가하려면:** [content-model.md](./content-model.md)로 형식을 익히고, 루트의
  `CONTRIBUTING.md`를 따르세요.
- **운영을 맡으셨다면:** [maintainer-runbook.md](./maintainer-runbook.md)를 일상 절차서로 삼고,
  [policy.md](./policy.md)와 [deployment.md](./deployment.md)를 정본으로 참조하세요.
