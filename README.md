# R-punghoe

알풍회는 알상무의 공개 활동, 영상, 발언, 밈, 자료 흔적을 출처와 함께 정리하는 비공식 아카이브 위키입니다.

이 프로젝트는 팬 프로젝트이며 알상무 본인, 슈카친구들, 머니코믹스와 공식 관계가 없습니다. 모든 기록은 공개된 자료를 기준으로 남기고, 사생활 수집이나 무근거 추측은 다루지 않습니다.

## 방향

- 공개 영상, 기사, 방송 설명, 공식 채널 링크 중심으로 기록합니다.
- 각 항목은 가능한 한 날짜, 출처, 타임스탬프, 검증 상태를 함께 남깁니다.
- 투자 조언처럼 보이는 표현을 피하고, 기록과 맥락 설명에 집중합니다.
- 팬덤 밈은 보존하되 특정 개인을 공격하거나 사생활을 추적하지 않습니다.

## 기술 스택

- [Astro](https://astro.build/)
- [Starlight](https://starlight.astro.build/)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)

## 로컬 개발

```bash
npm install
npm run dev
```

개발 서버는 기본적으로 `http://localhost:4321`에서 실행됩니다.

## 빌드

```bash
npm run build
npm run preview
```

빌드 결과물은 `dist/`에 생성됩니다.

## Cloudflare Pages 배포

Cloudflare Pages에서 GitHub 저장소를 연결한 뒤 아래 값으로 설정합니다.

```txt
Framework preset: Astro
Build command: npm run build
Build output directory: dist
Production branch: main
```

`wrangler.jsonc`에도 Pages용 기본 출력 디렉터리를 설정해 두었습니다.

## 문서 구조

```txt
src/content/docs/
  index.mdx              홈
  about.md               프로젝트 소개
  principles.md          기록 원칙
  contributing.md        기여 방법
  archive/timeline.md    연대기
  archive/glossary.md    용어사전
```

## 기여 원칙

기여할 때는 다음 형식을 권장합니다.

```md
## 제목

- 날짜:
- 출처:
- 타임스탬프:
- 검증 상태:
- 요약:
```

금지 항목은 다음과 같습니다.

- 비공개 개인정보
- 가족, 주소, 연락처, 사적 동선
- 출처 없는 루머
- 투자 매수/매도 권유
- 영상 전체 전사 또는 과도한 저작물 복제

## 라이선스

코드와 문서 라이선스는 아직 확정하지 않았습니다. 공개 기여를 받기 전 별도 라이선스를 추가할 예정입니다.
