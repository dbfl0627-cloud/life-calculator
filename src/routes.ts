/** 실제 서비스 주소. 개인 도메인을 연결하면 이 값만 바꾸면 canonical·sitemap·OG URL이 함께 바뀝니다. */
export const SITE_URL = 'https://zipmoya.com';
export type RouteMeta = { title:string; description:string; canonical:string; inSitemap:boolean };
const CALC_TITLE = '주담대 계산기 · 주택담보대출 계산기 | ZIPMOYA';
const CALC_DESC = '주담대 계산기로 주택담보대출 월 상환액과 총 이자를 바로 계산하세요. 원리금균등·원금균등 상환방식, 거치기간, 월별 상환표까지 무료로 확인할 수 있습니다.';
export const ROUTES: Record<string, RouteMeta> = {
  '/': { title:CALC_TITLE, description:CALC_DESC, canonical:'/', inSitemap:true },
  // 홈과 같은 계산기 화면이므로 검색 결과가 나뉘지 않도록 홈을 대표 주소로 지정
  '/mortgage/': { title:CALC_TITLE, description:CALC_DESC, canonical:'/', inSitemap:false },
  '/about/': { title:'ZIPMOYA(집모야) 소개 | ZIPMOYA', description:'ZIPMOYA(집모야)는 주담대 계산기 등 집과 부동산에 관한 계산 도구와 정보를 제공합니다.', canonical:'/about/', inSitemap:true },
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
