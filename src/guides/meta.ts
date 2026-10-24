/** 가이드(정보 글) 목록. 새 글은 여기에 추가하고 content.tsx에 본문을 넣으면 메뉴·sitemap·구조화 데이터에 자동 반영됩니다. */
export type GuideImage = 'steps' | 'salary' | 'stress' | 'ratio' | 'repay' | 'term' | 'rate' | 'grace' | 'cost' | 'tag';
export type GuideMeta = { slug: string; title: string; description: string; date: string; updated?: string; tag: string; tools: string[]; image: GuideImage };

export const GUIDE_META: GuideMeta[] = [
  { slug: 'home-buying-plan', image: 'steps', tag: '내 집 마련', title: '내 집 마련 자금 계획 5단계: 대출한도부터 부대비용까지', description: 'LTV와 DSR로 대출한도를 확인하고, 필요 자금과 취득세·중개보수 같은 부대비용까지 순서대로 계산하는 내 집 마련 자금 계획법을 정리했습니다.', date: '2026-10-25', tools: ['/find-home/', '/ltv/', '/dsr/'] },
  { slug: 'salary-loan-limit', image: 'salary', tag: '대출한도', title: '연봉별 주택담보대출 한도 정리 (DSR 40% 기준)', description: '연봉 3천만원부터 1억원까지 DSR 40% 기준 주택담보대출 한도를 금리·기간별로 계산하고, 스트레스 DSR 적용 시 한도가 얼마나 줄어드는지 비교합니다.', date: '2026-10-25', tools: ['/dsr/', '/find-home/'] },
  { slug: 'stress-dsr', image: 'stress', tag: '대출규제', title: '스트레스 DSR이란? 단계별 적용과 한도 변화 쉽게 정리', description: '스트레스 DSR의 개념과 1·2·3단계 차이, 지역·금리유형별 반영 방식, 실제 대출한도가 얼마나 줄어드는지 예시로 설명합니다.', date: '2026-10-25', tools: ['/dsr/'] },
  { slug: 'ltv-dsr-dti', image: 'ratio', tag: '대출규제', title: 'LTV·DSR·DTI 차이 한 번에 정리', description: '주택담보대출 한도를 정하는 LTV, DSR, DTI가 각각 무엇을 기준으로 하는지, 실제 한도는 어떻게 정해지는지 예시와 함께 정리했습니다.', date: '2026-10-25', tools: ['/ltv/', '/dsr/'] },
  { slug: 'equal-payment-vs-principal', image: 'repay', tag: '상환방식', title: '원리금균등 vs 원금균등, 총 이자는 얼마나 차이 날까', description: '같은 금액을 빌려도 상환방식에 따라 월 상환액과 총 이자가 달라집니다. 3억원 대출 기준으로 두 방식을 숫자로 비교합니다.', date: '2026-10-25', tools: ['/'] },
  { slug: 'loan-term', image: 'term', tag: '상환방식', title: '대출기간 30년 vs 40년 vs 50년, 무엇이 유리할까', description: '대출기간을 늘리면 월 상환액은 줄지만 총 이자는 늘어납니다. 기간별 월 상환액, 총 이자, DSR 한도 변화를 비교합니다.', date: '2026-10-25', tools: ['/', '/dsr/'] },
  { slug: 'interest-rate-1p', image: 'rate', tag: '금리', title: '금리 1%p 차이, 총 이자는 얼마나 달라질까', description: '주택담보대출 금리가 1%p 오르거나 내리면 월 상환액과 총 이자, 대출한도가 얼마나 변하는지 실제 숫자로 계산했습니다.', date: '2026-10-25', tools: ['/', '/dsr/'] },
  { slug: 'grace-period', image: 'grace', tag: '상환방식', title: '거치기간, 이자만 내면 이득일까?', description: '거치기간을 두면 처음 몇 년은 이자만 내지만, 이후 상환액과 총 이자가 늘어납니다. 거치기간 유무에 따른 차이를 계산해 봤습니다.', date: '2026-10-25', tools: ['/'] },
  { slug: 'buying-costs', image: 'cost', tag: '내 집 마련', title: '아파트 살 때 드는 돈 총정리: 취득세·중개보수·부대비용', description: '아파트 구입 시 집값 외에 드는 취득세, 중개보수, 등기비용, 대출 관련 비용을 가격대별로 정리하고 얼마를 따로 준비해야 하는지 계산합니다.', date: '2026-10-25', tools: ['/find-home/'] },
  { slug: 'real-price-vs-kb', image: 'tag', tag: '시세', title: '실거래가와 시세(KB시세) 차이, 무엇을 봐야 할까', description: '국토교통부 실거래가와 KB시세가 어떻게 다른지, 대출한도와 매수 가격을 판단할 때 각각 어떻게 활용하면 좋은지 정리했습니다.', date: '2026-10-25', tools: ['/find-home/', '/ltv/'] },
];

export const guidePath = (slug: string) => `/guide/${slug}/`;

/** 가이드 목록 한 페이지당 글 수 */
export const GUIDES_PER_PAGE = 10;
/** 최신 글이 먼저: 날짜(수정일 우선) 내림차순, 같은 날짜면 목록에 적힌 순서대로 */
export const GUIDES_SORTED = GUIDE_META.map((g, i) => ({ g, i }))
  .sort((a, b) => (b.g.updated ?? b.g.date).localeCompare(a.g.updated ?? a.g.date) || a.i - b.i)
  .map(x => x.g);
export const guidePageCount = () => Math.max(1, Math.ceil(GUIDE_META.length / GUIDES_PER_PAGE));
export const guideListPath = (page: number) => page <= 1 ? '/guide/' : `/guide/page/${page}/`;
