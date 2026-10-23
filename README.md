# ZIPMOYA (집모야)

서비스 주소: https://zipmoya.com

무료 주택담보대출 계산기 (Vite + React + TypeScript).

## 실행

Node.js 22 이상 권장.

```bash
npm install
npm run dev
```

터미널에 표시된 로컬 주소(보통 http://localhost:5173)를 엽니다.

## 빌드

```bash
npm run build
npm run preview
```

## Cloudflare Pages 배포

1. GitHub에 이 프로젝트를 새 저장소로 업로드합니다.
2. Cloudflare 대시보드 > Workers & Pages > Create > Pages > Connect to Git을 선택합니다. (화면 명칭은 변경될 수 있습니다.)
3. 저장소를 선택합니다.
4. Framework preset: **Vite**, Build command: **npm run build**, Build output directory: **dist**.
5. 배포하면 `프로젝트명.pages.dev` 주소가 발급됩니다.
6. 개인 도메인을 구매한 후 Cloudflare Pages Custom domains에서 연결할 수 있습니다.

## 광고 및 SEO 공개 전 체크리스트

- **중요**: 이 프로젝트는 정적 React SPA입니다. `dist/mortgage/index.html` 등의 파일은 생성되지만 본문이 JS로 렌더링되므로, 강한 SEO를 위해 추후 SSG/프리렌더 도입을 권장합니다.
- 운영자 실명/연락 수단, 개인정보처리방침, 사이트 소개를 실제 내용으로 수정하세요.
- 정식 도메인 연결 후 sitemap.xml, robots.txt, canonical URL, OG URL을 실제 도메인으로 설정하세요.
- 광고·분석 도구 도입 시 쿠키와 개인정보처리방침을 수정하세요.
- 금융기관 실제 상품과 금리, 원 단위 계산 방식, 약정 조건은 다를 수 있습니다.
- AdSense 승인은 보장되지 않습니다. 사이트 소유권과 도메인 등록 요건을 별도로 확인하세요.
- 광고 클릭 유도 및 자기 광고 클릭을 금지합니다.

## 계산 가정

- 대출기간에 거치기간 포함
- 거치기간은 이자만 납부
- 월 이율 = 연 이율 / 12
- 변동금리, 중도상환, 수수료 및 세금 미반영
- 표시값은 원 단위 반올림, 내부 계산은 소수점 유지
