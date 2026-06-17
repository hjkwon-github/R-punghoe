# 배포 가이드 (Cloudflare Pages)

R-punghoe(알풍회)는 **정적 사이트**입니다. Astro + Starlight로 빌드한 정적 파일(`dist/`)을
Cloudflare Pages에 올리는 방식이며, **데이터베이스·서버·백엔드는 일절 사용하지 않습니다.**
검색(Pagefind)과 사이트맵은 빌드 과정에서 자동으로 생성됩니다.

배포 방법은 두 가지가 있습니다.

- **(A) Cloudflare Pages 대시보드 Git 연동 — 권장**
- **(B) GitHub Actions(wrangler-action) — 선택**

> **권장 결론:** 처음 구축하거나 별다른 이유가 없다면 **(A) Git 연동**을 사용하세요.
> 저장소를 한 번만 연결하면 `main` 푸시마다 자동 배포되고, Pull Request마다 미리보기
> 배포가 자동으로 만들어집니다. 별도 시크릿 관리도 필요 없습니다.
> **(A)와 (B)를 동시에 켜면 같은 커밋이 두 번 배포되니, 둘 중 하나만 사용하세요.**

---

## 사전 준비

- GitHub 저장소: <https://github.com/hjkwon-github/R-punghoe>
- Cloudflare 계정 (무료 플랜으로 충분)
- 로컬에서 빌드가 통과하는지 먼저 확인:

  ```bash
  npm ci
  npm run build
  ```

  빌드 산출물은 `dist/` 폴더에 생성됩니다.

빌드 설정값 요약 (두 방법 모두 동일):

| 항목 | 값 |
| --- | --- |
| 프레임워크 프리셋 | Astro |
| 빌드 명령 | `npm run build` |
| 빌드 출력 디렉터리 | `dist` |
| 프로덕션 브랜치 | `main` |
| Node 버전 | 20 LTS 이상 (예: `20` 또는 `22`) |
| Pages 프로젝트 이름 | `r-punghoe` |

---

## (A) Cloudflare Pages 대시보드 Git 연동 — 권장

### 1. 프로젝트 생성 및 저장소 연결

1. Cloudflare 대시보드에 로그인합니다.
2. 좌측 메뉴에서 **Workers & Pages → Create → Pages → Connect to Git** 을 선택합니다.
3. GitHub 계정을 연결하고 `hjkwon-github/R-punghoe` 저장소를 선택합니다.

### 2. 빌드 설정

빌드 설정 화면에서 다음과 같이 입력합니다.

- **Framework preset:** `Astro`
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Production branch:** `main`
- (선택) **Environment variables → Variables**: `NODE_VERSION = 20` 을 추가해 Node 버전을 고정합니다.

설정 후 **Save and Deploy** 를 누르면 첫 배포가 시작됩니다.

### 3. 자동 배포 동작

- `main` 브랜치에 푸시하면 **프로덕션 배포**가 자동으로 실행됩니다.
- Pull Request를 열거나 다른 브랜치에 푸시하면 **미리보기(Preview) 배포**가 자동 생성되어
  고유 URL이 만들어집니다. PR에서 변경 사항을 실제 화면으로 확인할 수 있습니다.

> 기여는 GitHub Issue/PR로만 받습니다. PR 미리보기 배포로 검토 후 머지하면
> 프로덕션에 반영되는 흐름이 자연스럽게 만들어집니다.

이 방법을 사용한다면 GitHub Actions의 `deploy.yml`은 켜지 않아도 됩니다
(기본적으로 비활성화되어 있습니다 — 아래 (B) 참고).

---

## (B) GitHub Actions (wrangler-action) — 선택

대시보드 Git 연동 대신 CI에서 직접 배포하고 싶을 때만 사용합니다.
저장소에는 이미 `.github/workflows/deploy.yml` 워크플로가 들어 있으며,
**저장소 변수(variable) `ENABLE_ACTIONS_DEPLOY`가 `true`일 때만** 동작합니다.
(기본값에서는 비활성화 상태이므로 (A)와 충돌하지 않습니다.)

### 1. Cloudflare API 토큰 만들기 (Pages: Edit 권한)

1. Cloudflare 대시보드 우상단 프로필 → **My Profile → API Tokens → Create Token**.
2. **Create Custom Token** 을 선택합니다.
3. 권한(Permissions)에 다음을 추가합니다.
   - **Account → Cloudflare Pages → Edit**
4. **Account Resources** 를 본인 계정으로 한정합니다.
5. 토큰을 생성하고, 화면에 표시된 토큰 값을 복사합니다.
   (이 값은 다시 볼 수 없으니 안전한 곳에 보관하세요.)

### 2. Account ID 확인

- Cloudflare 대시보드 → **Workers & Pages** 페이지 우측, 또는 계정 홈의 **Account ID** 를 복사합니다.

### 3. GitHub 저장소 시크릿/변수 등록

GitHub 저장소 → **Settings → Secrets and variables → Actions** 에서:

- **Secrets** 탭 → `New repository secret`
  - `CLOUDFLARE_API_TOKEN` = 위에서 만든 토큰
  - `CLOUDFLARE_ACCOUNT_ID` = 위에서 복사한 Account ID
- **Variables** 탭 → `New repository variable`
  - `ENABLE_ACTIONS_DEPLOY` = `true`  (이 값을 켜야 배포 워크플로가 실행됩니다.)

> Pages 프로젝트가 아직 없다면 첫 배포 전에 대시보드에서 이름 `r-punghoe`로
> 빈 Pages 프로젝트를 만들어 두거나, (A) 절차로 한 번 배포해 두는 것이 안전합니다.

### 4. 동작 방식

- `main`에 푸시되면 `deploy.yml`이 `npm ci → npm run build` 후
  `wrangler pages deploy dist --project-name=r-punghoe` 명령으로 배포합니다.
- Actions 탭에서 수동 실행(`workflow_dispatch`)도 가능합니다.

### 참고: CI 빌드 검증 (`ci.yml`)

`main`이 아닌 브랜치 푸시와 모든 Pull Request에서 `ci.yml`이 `npm ci → npm run build`만
실행하여 빌드 통과 여부를 검증합니다. 배포는 하지 않으며, (A)/(B) 중 무엇을 쓰든
항상 켜 두는 것이 좋습니다.

---

## 커스텀 도메인 연결

1. Pages 프로젝트 → **Custom domains → Set up a custom domain** 으로 이동합니다.
2. 연결할 도메인(예: `r-punghoe.example.com` 또는 루트 도메인)을 입력합니다.
3. **도메인이 Cloudflare에서 관리되는 경우:** DNS 레코드가 자동으로 추가됩니다.
4. **외부 DNS를 쓰는 경우:** 안내에 따라 **CNAME** 레코드를
   `r-punghoe.pages.dev` 로 가리키도록 추가합니다.
   (루트/Apex 도메인은 CNAME flattening 또는 Cloudflare 네임서버 사용을 권장합니다.)
5. 검증이 끝나면 **HTTPS 인증서가 자동 발급·갱신**됩니다. 별도 설정이 필요 없습니다.

> 커스텀 도메인을 적용하면, 검색엔진 정합성을 위해 `astro.config.mjs`의 `site` 값과
> `public/robots.txt`의 `Sitemap:` URL을 새 도메인으로 맞추는 것이 좋습니다.
> (두 파일은 이 가이드의 담당 범위 밖이라 직접 수정하지 않았습니다.)

---

## `_headers` / `_redirects` 동작 방식

`public/` 폴더의 파일은 빌드 시 `dist/` 루트로 그대로 복사되며, Cloudflare Pages가
다음 두 파일을 특별 취급합니다.

- **`_headers`** — 응답 헤더 규칙. 이 사이트에서는 전역 보안 헤더
  (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`, `Content-Security-Policy`, `Strict-Transport-Security`)와
  해시 처리된 빌드 자산(`/_astro/*`)에 대한 장기 캐시(`immutable`)를 설정합니다.
  CSP는 Starlight/Astro의 인라인 스타일·스크립트와 Pagefind의 WebAssembly(검색)를
  깨뜨리지 않도록 검증된 값으로 맞춰져 있습니다.
- **`_redirects`** — 경로 리다이렉트 규칙. 현재는 별도 규칙이 없으며(주석 예시만 포함),
  페이지가 실제로 이동·이름 변경될 때만 항목을 추가합니다.

> 두 파일은 Pages 환경에서만 적용됩니다. 로컬 `npm run preview`에서는 적용되지 않을 수
> 있으므로, 헤더 동작은 배포된 미리보기/프로덕션 URL에서 확인하세요.
> 확인 방법(예): `curl -I https://r-punghoe.pages.dev/` 로 응답 헤더를 검사합니다.

---

## 롤백 (이전 배포로 되돌리기)

Cloudflare Pages는 모든 배포 이력을 보관하므로 즉시 롤백할 수 있습니다.

1. Pages 프로젝트 → **Deployments** 탭으로 이동합니다.
2. 되돌리고 싶은 (정상 동작하던) 과거 배포를 찾습니다.
3. 해당 배포의 **... 메뉴 → Rollback to this deployment** 을 선택합니다.

또는 문제를 일으킨 커밋을 `git revert` 한 뒤 `main`에 푸시하면, 새 정상 배포가
다시 만들어집니다. 빠른 복구가 필요하면 대시보드 롤백을, 영구 수정에는 `git revert`를
사용하세요.

---

## 검색(Pagefind)과 사이트맵에 대한 메모

- **검색:** Starlight 내장 검색은 **Pagefind**(클라이언트 사이드)로, `npm run build`
  시 색인이 자동 생성되어 `dist/pagefind/`에 포함됩니다. 별도 검색 서버가 없습니다.
- **사이트맵:** `astro.config.mjs`에 `site` 값이 설정되어 있어 빌드 시
  `/sitemap-index.xml` 과 `/sitemap-0.xml` 이 자동 생성됩니다.
  `public/robots.txt`는 `sitemap-index.xml`을 가리킵니다.
- **색인 정책(의도적 선택):** `public/robots.txt`는 현재 모든 크롤러의 전체 색인을
  허용(`Allow: /`)합니다. 이 프로젝트는 공개 자료만 다루므로 검색 노출을 허용하는 것이
  기본값이지만, 사생활·정정·삭제(takedown) 정책을 운영하는 특성상 **의식적인 결정**입니다.
  특정 경로를 색인에서 빼고 싶다면 `robots.txt`에 `Disallow:` 규칙을 추가하세요(개별
  페이지는 해당 페이지 frontmatter에 `noindex` 메타를 두는 방법도 있습니다).

즉, 검색과 사이트맵 모두 **정적 빌드만으로 자동 완성**되며 추가 인프라가 필요 없습니다.
