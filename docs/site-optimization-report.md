# 특허고고 사이트 최적화 리포트

검토일: 2026-06-06

## 적용 완료

- 사이트 페르소나: `docs/site-persona.md`에 배터리 특허맵 데이터 해설자 톤을 고정했다.
- SEO: canonical, OG/Twitter metadata, Organization/WebSite/Article/FAQ/CollectionPage JSON-LD를 추가했다.
- 색인: `/sitemap.xml`, `/robots.txt`, `/feed.xml`, `/llms.txt`를 제공한다.
- 블로그 UX: `/blog/`를 카드형 글 목록으로 구성하고 기존 guide/tech/ranking/company 랜딩을 글 카드로 재사용한다.
- 글 UX: 대표 상세 페이지군에 직접 답변, 키워드 칩, 목차, 본문 섹션, 관련 데이터 링크를 배치했다.
- AdSense: 기본 publisher `ca-pub-3050601904412736` 기준 loader와 `/ads.txt`를 추가했다.
- GA4: `NEXT_PUBLIC_GA_MEASUREMENT_ID`가 설정되면 GA4 gtag가 자동 삽입되도록 구현했다.
- GSC/Naver: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_NAVER_SITE_VERIFICATION` 환경변수가 있으면 verification meta가 자동 삽입되도록 구현했다.
- 반응형: `/blog/` 카드 그리드와 글 상세 레이아웃이 390px, 768px, 1366px 폭에서 대응되도록 CSS를 보강했다.

## 인증/API 확인 상태

- GSC: `D:\env\gsc_credentials.json`로 Search Console API 연결 성공. 접근 가능한 site property 88개 중 `tukhugogo` 매칭 property는 0개였다.
- AdSense: `D:\env\adsense_oauth_client.json`, `D:\env\adsense_token.json`로 AdSense API 연결 성공. 접근 가능한 계정 1개를 확인했다.
- GA4: 현재 `D:\env`에서 이 사이트용 GA4 property id나 credential 파일은 확인되지 않았다. 배포 환경에서는 `NEXT_PUBLIC_GA_MEASUREMENT_ID`를 설정하면 즉시 활성화된다.

## 운영 환경 변수

- `NEXT_PUBLIC_SITE_URL`: canonical/OG/sitemap host
- `TURSO_DATABASE_URL`: Turso database URL
- `TURSO_AUTH_TOKEN`: Turso auth token
- `DATA_AS_OF`: Turso 데이터 기준일
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: GA4 measurement id
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`: Google Search Console verification token
- `NEXT_PUBLIC_NAVER_SITE_VERIFICATION`: Naver Search Advisor verification token

## 검증 항목

- `npm run check`
- `npm run build`
- `npm audit --audit-level=moderate`
- 주요 URL 200 응답: `/`, `/blog/`, `/guide/kipris-search/`, `/tech/solid/`, `/company/c1/`, `/ranking/solid/`, `/sitemap.xml`, `/feed.xml`, `/robots.txt`, `/llms.txt`, `/ads.txt`, `/api/patent-metrics/`
- XML parse: `/sitemap.xml`, `/feed.xml`
- 화면 확인: `/blog/` desktop, `/guide/kipris-search/` mobile

## 남은 운영 작업

- Vercel 프로젝트에 GA4 measurement id와 GSC verification token을 환경변수로 등록한다.
- GSC property에 `https://tukhugogo.vercel.app/` 또는 실제 커스텀 도메인을 등록하고 `/sitemap.xml`을 제출한다. 현재 API 계정에는 이 사이트 property가 없다.
- AdSense 콘솔에서 `/ads.txt` 인식과 사이트 승인 상태를 확인한다.
- Turso 실데이터 연결 전 KIPRIS/KIPRISPlus 재배포 라이선스를 확인한다.
