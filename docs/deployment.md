# 배포 가이드 (Cloudflare Workers · Static Assets)

R-punghoe(알풍회)는 **정적 사이트**입니다. Astro + Starlight로 빌드한 정적 파일(`dist/`)을
**Cloudflare Workers의 Static Assets(정적 자산)** 로 올리는 방식이며,
**데이터베이스·서버·백엔드는 일절 사용하지 않습니다.**

> **"Workers인데 왜 백엔드가 없나요?"** 이 프로젝트에는 Worker 스크립트(서버 코드)가 없습니다.
> `wrangler deploy`는 단지 빌드 산출물(`dist/`)을 **정적 자산으로 업로드**할 뿐이라,
> 사이트는 여전히 100% 정적입니다. (예전의 Cloudflare **Pages**에서 **Workers Static Assets**로
> 옮겼을 뿐, 동작은 동일하게 정적 파일 호스팅입니다.)

검색(Pagefind)과 사이트맵은 빌드 과정에서 자동으로 생성됩니다.

배포 방법은 두 가지가 있습니다.

- **(A) Cloudflare 대시보드 Git 연동(Workers Builds) — 권장, 그리고 이미 구성되어 있는 방식**
- **(B) GitHub Actions(`cloudflare/wrangler-action@v3`) — 선택, 기본 비활성화**

> **권장 결론:** 처음 구축하거나 별다른 이유가 없다면 **(A) Git 연동**을 사용하세요.
> 저장소를 한 번만 연결하면 `main` 푸시마다 자동 빌드·배포되고, Pull Request마다 미리보기
> 배포가 자동으로 만들어집니다. 별도 시크릿 관리도 필요 없습니다.
> **(A)와 (B)를 동시에 켜면 같은 커밋이 두 번 배포되니, 둘 중 하나만 사용하세요.**

---

## 설정 파일: `wrangler.jsonc`

배포 동작은 저장소 루트의 `wrangler.jsonc`에 정의되어 있습니다.
(이 파일은 이미 올바르게 설정되어 있으니 그대로 두면 됩니다.)

| 키 | 값 | 의미 |
| --- | --- | --- |
| `name` | `"r-punghoe"` | 대시보드의 Worker/프로젝트 이름과 일치해야 합니다. |
| `compatibility_date` | (날짜) | Workers 런타임 호환성 기준일. |
| `assets.directory` | `"./dist"` | 업로드할 정적 빌드 출력 폴더. |
| `assets.not_found_handling` | `"404-page"` | 없는 경로 요청 시 생성된 `404.html`을 응답. |

`main`(Worker 스크립트 경로)이나 `pages_build_output_dir` 키는 **없습니다.**
`main`이 없다는 것은 곧 **서버 코드가 없다**는 뜻이고, `wrangler deploy`는 `assets.directory`의
정적 파일만 업로드합니다.

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

빌드/배포 설정값 요약 (두 방법 모두 동일):

| 항목 | 값 |
| --- | --- |
| 프레임워크 | Astro + Starlight |
| 빌드 명령 | `npm run build` |
| 배포 명령 | `npx wrangler deploy` |
| 정적 자산 디렉터리 | `./dist` (`wrangler.jsonc`의 `assets.directory`) |
| 프로덕션 브랜치 | `main` |
| Worker 이름 | `r-punghoe` (`wrangler.jsonc`의 `name`) |

---

## (A) 대시보드 Git 연동 (Workers Builds) — 권장 · 현재 구성됨

저장소는 이미 Cloudflare **Workers Builds**(Git 통합)로 연결되어 있습니다.
푸시가 들어오면 Cloudflare가 `npm run build`로 빌드한 뒤 `npx wrangler deploy`로 배포합니다.
처음부터 새로 연결할 때의 절차는 다음과 같습니다.

### 1. 프로젝트 생성 및 저장소 연결

1. Cloudflare 대시보드에 로그인합니다.
2. 좌측 메뉴에서 **Workers & Pages → Create → Workers** 를 선택합니다.
3. **Connect to Git**(또는 **Import a repository**)을 고르고, GitHub 계정을 연결한 뒤
   `hjkwon-github/R-punghoe` 저장소를 선택합니다.

### 2. 빌드·배포 설정

빌드 설정 화면에서 다음과 같이 지정합니다.
(대부분 `wrangler.jsonc`에서 **자동 감지**되므로 그대로 두어도 됩니다.)

- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy`
- **Production branch:** `main`

설정 후 **Save and Deploy** 를 누르면 첫 배포가 시작됩니다.

### 3. 자동 배포 동작

- `main` 브랜치에 푸시하면 **프로덕션 배포**가 자동으로 실행됩니다.
- Pull Request를 열거나 프로덕션이 아닌 다른 브랜치에 푸시하면 **미리보기(Preview) 배포**가
  자동 생성되어 고유 URL이 만들어집니다. PR에서 변경 사항을 실제 화면으로 확인할 수 있습니다.

> 기여는 GitHub Issue/PR로만 받습니다. PR 미리보기 배포로 검토 후 머지하면
> 프로덕션에 반영되는 흐름이 자연스럽게 만들어집니다.

이 방법을 사용한다면 GitHub Actions의 `deploy.yml`은 켜지 않아도 됩니다
(기본적으로 비활성화되어 있습니다 — 아래 (B) 참고).

### 4. 첫 배포 후: 배포 URL과 `site`/robots 맞추기 (중요)

기본 배포 URL은 다음 형태입니다.

```
https://<name>.<account-subdomain>.workers.dev
```

즉 이 프로젝트는 `https://r-punghoe.<your-subdomain>.workers.dev` 가 됩니다.
**`*.pages.dev`가 아닙니다.** (이전 Pages 방식의 흔적이 남아 있다면 헷갈리지 마세요.)

첫 배포로 실제 origin이 정해지면, 검색엔진·사이트맵 정합성을 위해 다음 두 곳을
**실제 origin**(workers.dev URL 또는 아래에서 연결하는 커스텀 도메인)으로 맞추세요.

- `astro.config.mjs` 의 `site` 값
- `public/robots.txt` 의 `Sitemap:` 줄

(두 파일은 이 가이드의 담당 범위 밖이라 직접 수정하지 않았습니다. 첫 배포 후 사용자가
실제 origin으로 갱신해 주세요.)

---

## (B) GitHub Actions (`cloudflare/wrangler-action@v3`) — 선택 · 기본 비활성화

대시보드 Git 연동 대신 CI에서 직접 배포하고 싶을 때만 사용합니다.
저장소에는 `.github/workflows/deploy.yml` 워크플로가 들어 있으며,
**저장소 변수(variable) `ENABLE_ACTIONS_DEPLOY`가 `true`일 때만** 동작합니다.
(기본값에서는 비활성화 상태이므로 (A)와 충돌하지 않습니다.)

이 워크플로는 `npm run build` 후 `cloudflare/wrangler-action@v3`을 `command: deploy`로 호출합니다.
`deploy` 명령은 `wrangler.jsonc`를 읽어 `dist/`를 정적 자산으로 업로드하므로,
프로젝트 이름·디렉터리를 명령줄에 따로 적을 필요가 없습니다.

### 1. Cloudflare API 토큰 만들기 (Edit Cloudflare Workers 권한)

1. Cloudflare 대시보드 우상단 프로필 → **My Profile → API Tokens → Create Token**.
2. 템플릿 **Edit Cloudflare Workers** 를 선택합니다.
   (Custom Token으로 만들 경우 권한에 **Account → Workers Scripts → Edit** 를 추가합니다.)
3. **Account Resources** 를 본인 계정으로 한정합니다.
4. 토큰을 생성하고, 화면에 표시된 토큰 값을 복사합니다.
   (이 값은 다시 볼 수 없으니 안전한 곳에 보관하세요.)

### 2. Account ID 확인

- Cloudflare 대시보드 → **Workers & Pages** 페이지 우측, 또는 계정 홈의 **Account ID** 를 복사합니다.

### 3. GitHub 저장소 시크릿/변수 등록

GitHub 저장소 → **Settings → Secrets and variables → Actions** 에서:

- **Secrets** 탭 → `New repository secret`
  - `CLOUDFLARE_API_TOKEN` = 위에서 만든 토큰 (Edit Cloudflare Workers)
  - `CLOUDFLARE_ACCOUNT_ID` = 위에서 복사한 Account ID
- **Variables** 탭 → `New repository variable`
  - `ENABLE_ACTIONS_DEPLOY` = `true`  (이 값을 켜야 배포 워크플로가 실행됩니다.)

### 4. 동작 방식

- `main`에 푸시되면 워크플로가 `npm ci → npm run build` 후
  `cloudflare/wrangler-action@v3`을 `command: deploy`로 실행해 배포합니다.
  (`deploy`가 `wrangler.jsonc`를 참조하므로 `dist/`가 정적 자산으로 올라갑니다.)
- Actions 탭에서 수동 실행(`workflow_dispatch`)도 가능합니다.

> **(A)와 (B)를 동시에 켜지 마세요.** 둘 다 켜면 같은 커밋이 두 번 배포됩니다.
> (A)를 쓰는 동안에는 `ENABLE_ACTIONS_DEPLOY`를 설정하지 않은 채로 두면 됩니다.

### 참고: CI 빌드 검증 (`ci.yml`)

`main`이 아닌 브랜치 푸시와 모든 Pull Request에서 `ci.yml`이 `npm ci → npm run build`만
실행하여 빌드 통과 여부를 검증합니다. 배포는 하지 않으며, (A)/(B) 중 무엇을 쓰든
항상 켜 두는 것이 좋습니다.

---

## 커스텀 도메인 연결

1. 대시보드에서 해당 **Worker → Settings → Domains & Routes** 로 이동합니다.
2. **Add → Custom Domain** 을 선택하고 연결할 도메인(예: `r-punghoe.example.com` 또는
   루트 도메인)을 입력합니다.
3. **도메인이 Cloudflare에서 관리되는 경우:** DNS 레코드가 자동으로 추가됩니다.
4. **외부 DNS를 쓰는 경우:** 안내에 따라 DNS 레코드를 추가합니다.
   (루트/Apex 도메인은 CNAME flattening 또는 Cloudflare 네임서버 사용을 권장합니다.)
5. 검증이 끝나면 **HTTPS 인증서가 자동 발급·갱신**됩니다. 별도 설정이 필요 없습니다.

> 커스텀 도메인을 적용하면, 검색엔진 정합성을 위해 `astro.config.mjs`의 `site` 값과
> `public/robots.txt`의 `Sitemap:` URL을 새 도메인으로 맞추는 것이 좋습니다.
> (위 "(A) 4. 첫 배포 후" 항목과 동일한 작업이며, 두 파일은 이 가이드의 담당 범위 밖이라
> 직접 수정하지 않았습니다.)

---

## `_headers` / `_redirects` 동작 방식

`public/` 폴더의 파일은 빌드 시 `dist/` 루트로 그대로 복사되며, **Workers Static Assets가
다음 두 파일을 기본으로 지원(native)** 합니다. Worker 스크립트가 없으므로 이 규칙을
우회하는 코드도 없고, 모든 정적 응답에 그대로 적용됩니다.

- **`_headers`** — 응답 헤더 규칙. 이 사이트에서는 전역 보안 헤더
  (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`,
  `Permissions-Policy`, `Content-Security-Policy`, `Strict-Transport-Security`)와
  해시 처리된 빌드 자산(`/_astro/*`)에 대한 장기 캐시(`immutable`)를 설정합니다.
  CSP는 Starlight/Astro의 인라인 스타일·스크립트와 Pagefind의 WebAssembly(검색)를
  깨뜨리지 않도록 검증된 값으로 맞춰져 있습니다.
- **`_redirects`** — 경로 리다이렉트 규칙. 현재는 별도 규칙이 없으며(주석 예시만 포함),
  페이지가 실제로 이동·이름 변경될 때만 항목을 추가합니다.

> 두 파일은 배포된 Workers 환경에서 적용됩니다. 로컬 `npm run preview`에서는 적용되지 않을 수
> 있으므로, 헤더 동작은 배포된 미리보기/프로덕션 URL에서 확인하세요.
> 확인 방법(예): `curl -I https://r-punghoe.<your-subdomain>.workers.dev/` 로 응답 헤더를 검사합니다.

---

## 롤백 (이전 버전으로 되돌리기)

Workers는 배포할 때마다 **버전(version) 이력**을 보관하므로 즉시 롤백할 수 있습니다.

1. Cloudflare 대시보드 → 해당 **Worker → Deployments / Versions** 로 이동합니다.
2. 되돌리고 싶은 (정상 동작하던) 과거 버전을 찾습니다.
3. 해당 버전으로 **롤백(roll back)** 합니다.

또는 문제를 일으킨 커밋을 `git revert` 한 뒤 `main`에 푸시하면, 새 정상 배포가
다시 만들어집니다. 빠른 복구가 필요하면 대시보드 롤백을, 영구 수정에는 `git revert`를
사용하세요.

---

## 검색(Pagefind)과 사이트맵에 대한 메모

- **검색:** Starlight 내장 검색은 **Pagefind**(클라이언트 사이드)로, `npm run build`
  시 색인이 자동 생성되어 `dist/pagefind/`에 포함됩니다. 별도 검색 서버가 없습니다.
- **사이트맵:** `astro.config.mjs`에 `site` 값이 설정되어 있어 Starlight가 빌드 시
  `sitemap-index.xml`(과 `sitemap-0.xml`)을 자동으로 생성합니다.
  `public/robots.txt`는 이 `sitemap-index.xml`을 가리킵니다.
  (첫 배포 후 `site`와 robots의 URL을 실제 origin으로 맞추는 것을 잊지 마세요 — 위 (A) 4 참고.)
- **색인 정책(의도적 선택):** `public/robots.txt`는 현재 모든 크롤러의 전체 색인을
  허용(`Allow: /`)합니다. 이 프로젝트는 공개 자료만 다루므로 검색 노출을 허용하는 것이
  기본값이지만, 사생활·정정·삭제(takedown) 정책을 운영하는 특성상 **의식적인 결정**입니다.
  특정 경로를 색인에서 빼고 싶다면 `robots.txt`에 `Disallow:` 규칙을 추가하세요(개별
  페이지는 해당 페이지 frontmatter에 `noindex` 메타를 두는 방법도 있습니다).

즉, 검색과 사이트맵 모두 **정적 빌드만으로 자동 완성**되며 추가 인프라가 필요 없습니다.
