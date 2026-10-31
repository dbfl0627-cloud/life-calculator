/** 실제 서비스 주소. 개인 도메인을 연결하면 이 값만 바꾸면 canonical·sitemap·OG URL이 함께 바뀝니다. */
export const SITE_URL = 'https://zipmoya.com';
import { GUIDE_META, guidePath, guidePageCount, guideListPath } from './guides/meta';
import { BLOG_POSTS, blogPath, blogPageCount, blogListPath } from './blog/posts';
export type RouteMeta = { title:string; description:string; canonical:string; inSitemap:boolean; ogImage?:string };
const CALC_TITLE = '주담대 계산기 · 주택담보대출 계산기 | ZIPMOYA';
const CALC_DESC = '주담대 계산기로 주택담보대출 월 상환액과 총 이자를 바로 계산하세요. 원리금균등·원금균등 상환방식, 거치기간, 월별 상환표까지 무료로 확인할 수 있습니다.';
export const ROUTES: Record<string, RouteMeta> = {
  '/guide/': { title:'내 집 마련 대출·자금 가이드 | ZIPMOYA', description:'주택담보대출 한도, DSR·LTV, 스트레스 DSR, 상환방식, 취득세와 부대비용까지 내 집 마련에 필요한 내용을 계산 예시와 함께 정리한 ZIPMOYA 가이드입니다.', canonical:'/guide/', inSitemap:true },
  '/regulations/': { title:'주택담보대출 규제 총정리 (지역별 LTV·대출 한도·스트레스 DSR) | ZIPMOYA', description:'지금 적용 중인 지역별 LTV, 수도권·규제지역 주택가격별 대출 한도, DSR과 스트레스 금리, 규제지역 목록과 변경 이력을 한 페이지에 정리했습니다. 새 규제가 나오면 갱신합니다.', canonical:'/regulations/', inSitemap:true },
  '/blog/': { title:'부동산 블로그 - 이번 주 부동산·대출 뉴스 정리 | ZIPMOYA', description:'매주 수요일과 토요일, 최근 부동산·대출 뉴스를 골라 쉽게 정리하고 내 대출과 자금 계획에 미치는 영향을 계산 예시와 함께 알려드립니다.', canonical:'/blog/', inSitemap:true },
  ...Object.fromEntries(Array.from({ length: blogPageCount() - 1 }, (_, i) => i + 2).map(n => [blogListPath(n), { title:`부동산 블로그 ${n}페이지 | ZIPMOYA`, description:`ZIPMOYA 부동산 블로그 ${n}페이지입니다.`, canonical:blogListPath(n), inSitemap:true }])),
  ...Object.fromEntries(BLOG_POSTS.map(p => [blogPath(p.slug), { title:`${p.title} | ZIPMOYA 블로그`, description:p.summary || p.title, canonical:blogPath(p.slug), inSitemap:true }])),
  // 가이드 목록 2페이지부터: /guide/page/2/ …
  ...Object.fromEntries(Array.from({ length: guidePageCount() - 1 }, (_, i) => i + 2).map(n => [guideListPath(n), { title:`내 집 마련 대출·자금 가이드 ${n}페이지 | ZIPMOYA`, description:`ZIPMOYA 가이드 목록 ${n}페이지입니다. 주택담보대출 한도, DSR·LTV, 상환방식, 세금 등 내 집 마련 정보를 확인하세요.`, canonical:guideListPath(n), inSitemap:true }])),
  ...Object.fromEntries(GUIDE_META.map(g => [guidePath(g.slug), { title:`${g.title} | ZIPMOYA`, description:g.description, canonical:guidePath(g.slug), inSitemap:true }])),
  '/': { title:CALC_TITLE, description:CALC_DESC, canonical:'/', inSitemap:true },
  // 홈과 같은 계산기 화면이므로 검색 결과가 나뉘지 않도록 홈을 대표 주소로 지정
  '/mortgage/': { title:CALC_TITLE, description:CALC_DESC, canonical:'/', inSitemap:false },
  '/dsr/': { title:'DSR 계산기 - 연봉으로 대출한도 계산 | ZIPMOYA', description:'연소득과 기존 대출 상환액을 입력하면 DSR(총부채원리금상환비율)과 신규 대출 가능액을 바로 계산합니다. 스트레스 금리와 DSR 40%·50% 기준 비교까지 무료로 확인하세요.', canonical:'/dsr/', inSitemap:true, ogImage:'/og/dsr.png' },
  '/ltv/': { title:'LTV 계산기 - 집값으로 담보대출 한도 계산 | ZIPMOYA', description:'주택가격과 LTV 비율을 입력하면 담보가치 기준 주택담보대출 한도, 기존 대출 차감 후 추가 한도, 부족 자금을 바로 계산합니다. 무료 LTV 계산기.', canonical:'/ltv/', inSitemap:true, ogImage:'/og/ltv.png' },
  '/find-home/': { title:'내 집 찾기 - 내 연봉으로 살 수 있는 아파트 가격 계산 | ZIPMOYA', description:'연봉, 기존 대출, 보유 현금을 입력하면 DSR·LTV·대출 상한을 반영해 살 수 있는 아파트 최대 가격과 사고 싶은 아파트의 대출 가능액, 필요 자금, 취득세를 계산합니다.', canonical:'/find-home/', inSitemap:true },
  '/about/': { title:'ZIPMOYA(집모야) 소개 | ZIPMOYA', description:'ZIPMOYA(집모야)는 주담대 계산기, DSR 계산기, LTV 계산기 등 집과 부동산 대출에 관한 무료 계산 도구와 정보를 제공합니다.', canonical:'/about/', inSitemap:true },
  '/privacy/': { title:'개인정보처리방침 | ZIPMOYA', description:'ZIPMOYA의 개인정보 처리 방침입니다. 계산 입력값은 브라우저에서만 처리됩니다.', canonical:'/privacy/', inSitemap:true },
};
/** '/about' → '/about/', 알 수 없는 경로는 그대로 둡니다(홈 화면 표시). */
export function normalizePath(p:string){ return p.endsWith('/')?p:p+'/'; }
export function metaFor(p:string){ return ROUTES[normalizePath(p)] ?? ROUTES['/']; }
export function applyMeta(p:string){
  if(typeof document==='undefined') return;
  const m=metaFor(p); document.title=m.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content',m.description);
  document.querySelector('link[rel="canonical"]')?.setAttribute('href',SITE_URL+m.canonical);
}
