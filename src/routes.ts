export type RouteMeta = { title:string; description:string };
export const ROUTES: Record<string, RouteMeta> = {
  '/': { title:'생활계산소 | 주택담보대출 계산기', description:'주택담보대출 월 상환액, 총 이자, 거치기간과 상환방식을 무료로 비교하는 생활계산소입니다.' },
  '/mortgage/': { title:'주택담보대출 계산기 | 원리금균등·원금균등·거치기간 | 생활계산소', description:'대출금액, 금리, 기간, 거치기간을 입력하면 원리금균등·원금균등 방식의 월 납입액과 총 이자, 월별 상환표를 계산합니다.' },
  '/about/': { title:'사이트 소개 | 생활계산소', description:'생활계산소는 일상 속 숫자를 쉽게 계산하는 무료 도구를 제공합니다.' },
  '/privacy/': { title:'개인정보처리방침 | 생활계산소', description:'생활계산소의 개인정보 처리 방침입니다. 계산 입력값은 브라우저에서만 처리됩니다.' },
};
/** '/about' → '/about/', 알 수 없는 경로는 그대로 둡니다(홈 화면 표시). */
export function normalizePath(p:string){ return p.endsWith('/')?p:p+'/'; }
export function metaFor(p:string){ return ROUTES[normalizePath(p)] ?? ROUTES['/']; }
export function applyMeta(p:string){
  if(typeof document==='undefined') return;
  const m=metaFor(p); document.title=m.title;
  document.querySelector('meta[name="description"]')?.setAttribute('content',m.description);
}
