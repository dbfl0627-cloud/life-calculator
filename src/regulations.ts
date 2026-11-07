/**
 * 주택담보대출 규제 기준 — 사이트 전체(규제 총정리 페이지, 내 집 찾기 기본값, 예시 표)가 이 파일 하나를 씁니다.
 * 규제가 바뀌면 이 파일만 고치고 REG_CHECKED(최종 확인일)와 REG_HISTORY(변경 이력)를 함께 갱신하세요.
 * 금액 단위: 만원.
 */
export const REG_CHECKED = '2026-11-07';
export const REG_CHECKED_LABEL = '2026년 11월 7일';

export type RegionKey = 'regulated' | 'capital' | 'local';
export const REGION_RULES: Record<RegionKey, {
  label: string; short: string;
  ltv: number; ltvFirstTime: number;       // 무주택(처분조건부 1주택 포함) / 생애최초
  stress: number;                          // 주담대 스트레스 금리(%p)
  maxYears: number | null;                 // 주담대 최장 만기(년), 없으면 null
  caps: { upTo: number; cap: number }[];   // 주택가격 구간별 대출 상한 (없으면 빈 배열)
  note: string;
}> = {
  regulated: {
    label: '규제지역 (서울 전역·경기 12곳)', short: '규제지역', ltv: 40, ltvFirstTime: 70, stress: 3.0, maxYears: 30,
    caps: [{ upTo: 150000, cap: 60000 }, { upTo: 250000, cap: 40000 }, { upTo: Infinity, cap: 20000 }],
    note: '1주택 이상 보유자의 추가 구입 목적 주담대는 원칙적으로 불가. 대출 후 6개월 내 전입 필요.',
  },
  capital: {
    label: '수도권 비규제지역', short: '수도권', ltv: 70, ltvFirstTime: 70, stress: 3.0, maxYears: 30,
    caps: [{ upTo: 150000, cap: 60000 }, { upTo: 250000, cap: 40000 }, { upTo: Infinity, cap: 20000 }],
    note: '대출 상한은 수도권·규제지역 공통 기준.',
  },
  local: {
    label: '지방 (비수도권)', short: '지방', ltv: 70, ltvFirstTime: 80, stress: 0.75, maxYears: null,
    caps: [],
    note: '지방 주담대는 스트레스 DSR 3단계 대신 2단계(0.75%p)를 2026년 말까지 적용(유예).',
  },
};

/** 주택가격(만원)에 따른 지역 대출 상한(만원). 상한이 없으면 Infinity */
export function regionLoanCap(region: RegionKey, price: number): number {
  const caps = REGION_RULES[region].caps;
  if (!caps.length) return Infinity;
  return caps.find(c => price <= c.upTo)!.cap;
}

/** DSR 기준 (차주 총대출 1억원 초과 시) */
export const DSR_RULES = { bank: 40, nonBank: 50, appliesOver: 10000 };

/** 경기도 규제지역 (서울은 전역). 시군구 코드 → 이름 */
export const REGULATED_GYEONGGI: Record<string, string> = {
  '41290': '과천시', '41210': '광명시', '41131': '성남시 수정구', '41133': '성남시 중원구', '41135': '성남시 분당구',
  '41111': '수원시 장안구', '41115': '수원시 팔달구', '41117': '수원시 영통구', '41173': '안양시 동안구',
  '41465': '용인시 수지구', '41430': '의왕시', '41450': '하남시',
};

/** 변경 이력 (최신순). source는 실제로 확인한 자료 */
export const REG_HISTORY: { date: string; title: string; detail: string; sources: { title: string; url: string }[] }[] = [
  { date: '2026-06-18', title: '지방 스트레스 DSR 3단계 유예 연장',
    detail: '지방 주택담보대출은 3단계(1.5%p) 대신 2단계 스트레스 금리(0.75%p)를 2026년 말까지 계속 적용.',
    sources: [{ title: '토큰포스트 – 지방 주택담보대출 규제, 2026년까지 완화된 DSR 적용 지속', url: 'https://www.tokenpost.kr/news/policy/370889' }] },
  { date: '2025-10-16', title: '10·15 부동산 대책 시행',
    detail: '서울 전역과 경기 12곳 규제지역 지정, 규제지역 무주택자 LTV 40%, 수도권·규제지역 주담대 한도를 주택가격 15억 이하 6억 · 15~25억 4억 · 25억 초과 2억으로 차등, 수도권·규제지역 주담대 스트레스 금리 하한 1.5% → 3.0%.',
    sources: [
      { title: 'KB Think – 10.15 부동산 대책', url: 'https://kbthink.com/loan-guide/1015-measures.html' },
      { title: '디지털데일리 – 10.15 부동산 대책 발표', url: 'https://www.ddaily.co.kr/page/view/2025101510433284356' },
      { title: '경향신문 – 10·15 부동산 대책 주요 내용', url: 'https://www.khan.co.kr/article/202510152145015' },
    ] },
  { date: '2025-10-29', title: '1주택자 전세대출 DSR 반영',
    detail: '수도권·규제지역에서 1주택자가 받는 전세대출의 이자 상환분을 DSR에 포함.',
    sources: [{ title: '디지털데일리 – 10.15 부동산 대책 발표', url: 'https://www.ddaily.co.kr/page/view/2025101510433284356' }] },
  { date: '2025-06-28', title: '6·27 가계부채 대책 시행',
    detail: '수도권·규제지역 주담대 한도 최대 6억원, 만기 최장 30년, 생애최초 LTV 70%.',
    sources: [{ title: '주택담보대출 한도 2026 정리', url: 'https://charry3.com/entry/mortgage-limit-2026/' }] },
];
