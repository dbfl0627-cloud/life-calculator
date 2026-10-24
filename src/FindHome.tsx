import { useEffect, useMemo, useState } from 'react';
import SGG from './data/sgg.json';
import { MapPin, Wallet, TrendingDown, Info, Search, Home } from 'lucide-react';
import { monthlyPayment, loanFromMonthlyPayment } from './DSR';
import { koreanAmount } from './format';
import { FindHomeIllustration } from './Illustrations';
import { KakaoMap, type MapItem } from './KakaoMap';

/**
 * 내 집 찾기: 탭 1 "내가 살 수 있는 아파트"(예산 계산), 탭 2 "내가 사고 싶은 아파트"(필요 자금 계산).
 * 실거래가는 /api/apt (worker/index.ts)에서 국토교통부 API를 중계해 가져오고, 지도는 카카오맵(KakaoMap.tsx)으로 표시합니다.
 * 금액 단위: 만원.
 */

/** 지역 구분별 대표 규제값. 정책이 자주 바뀌므로 화면에서 수정할 수 있습니다. */
export const REGIONS = {
  regulated: { label: '규제지역 (서울 등)', ltv: 40, stress: 3.0 },
  capital: { label: '수도권 비규제지역', ltv: 70, stress: 3.0 },
  local: { label: '지방', ltv: 70, stress: 1.5 },
} as const;
type Region = keyof typeof REGIONS;

/** 수도권·규제지역 주택담보대출 금액 상한(만원). 규제지역은 주택가격 구간별, 수도권 비규제는 6억 일괄. 지방은 상한 없음. */
export function loanCap(region: Region, price: number): number {
  if (region === 'regulated') return price <= 150000 ? 60000 : price <= 250000 ? 40000 : 20000;
  if (region === 'capital') return 60000;
  return Infinity;
}

/** 1주택 유상취득 기준 취득세 + 지방교육세 (+ 85㎡ 초과 시 농어촌특별세) 합계 세율(%) */
export function acquisitionTaxRate(price: number, over85: boolean): number {
  const eok = price / 10000;
  const base = eok <= 6 ? 1 : eok <= 9 ? eok * 2 / 3 - 3 : 3;
  return base * 1.1 + (over85 ? 0.2 : 0);
}

type Inputs = { income: number; existingAnnual: number; cash: number; rate: number; years: number; region: Region; ltv: number; stress: number; dsrLimit: number };

function limits(i: Inputs, price: number) {
  const ltvLimit = price * i.ltv / 100;
  const cap = loanCap(i.region, price);
  const allowedAnnual = Math.max(0, i.income * i.dsrLimit / 100 - i.existingAnnual);
  const dsrLimit = loanFromMonthlyPayment(allowedAnnual / 12, i.rate + i.stress, i.years);
  const loan = Math.max(0, Math.min(ltvLimit, cap, dsrLimit));
  const binding = loan === dsrLimit ? 'DSR' : loan === cap ? '대출 상한' : 'LTV';
  return { ltvLimit, cap, dsrLimit, loan, binding };
}

/** 보유 현금 + 대출로 살 수 있는 최대 주택가격(만원). 100만원 단위로 탐색합니다. */
export function maxPrice(i: Inputs): number {
  let best = 0;
  for (let p = 100; p <= 1000000; p += 100) if (i.cash + limits(i, p).loan >= p) best = p;
  return best;
}

type AptType = { area: number; count: number; latestPrice: number; latestDate: string; minPrice: number; maxPrice: number };
type Apt = { name: string; dong: string; jibun: string; buildYear: number; types: AptType[] };
type AptState = { status: 'idle' | 'loading' | 'done' | 'error'; apts: Apt[]; error?: string; months?: string[] };
const SGG_MAP = SGG as Record<string, string[][]>;
const SIDO = Object.keys(SGG_MAP);
const sggOf = (sido: string) => SGG_MAP[sido] ?? [];
/** 시도 → 지역 구분 기본값 (서울은 전역 규제지역, 경기·인천은 수도권 비규제로 두고 필요하면 직접 변경) */
const regionOfSido = (sido: string): Region => sido === '서울특별시' ? 'regulated' : (sido === '경기도' || sido === '인천광역시') ? 'capital' : 'local';
const pyeong = (m2: number) => Math.round(m2 / 3.3058);
const sggName = (sido: string, lawd: string) => sggOf(sido).find(([c]) => c === lawd)?.[1] ?? '';
/** 실거래가 단지 → 지도 표시용 항목 (지번 주소로 좌표 변환, 실패 시 '동 + 단지명' 키워드 검색) */
const toMapItem = (sido: string, lawd: string, a: Apt, label: string, sub?: string): MapItem => ({
  id: `${a.dong}|${a.jibun}|${a.name}`, title: a.name, label, sub,
  address: `${sido} ${sggName(sido, lawd)} ${a.dong} ${a.jibun}`.trim(),
  keyword: `${sggName(sido, lawd)} ${a.dong} ${a.name}`,
});

/** 선택한 시군구의 최근 6개월 실거래가 단지 목록 */
function useApts(lawd: string): AptState {
  const [state, setState] = useState<AptState>({ status: 'idle', apts: [] });
  useEffect(() => {
    if (!lawd) { setState({ status: 'idle', apts: [] }); return; }
    let alive = true;
    setState({ status: 'loading', apts: [] });
    fetch(`/api/apt?lawd=${lawd}&months=6`)
      .then(async r => { const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || `조회 실패 (HTTP ${r.status})`); return d; })
      .then(d => alive && setState({ status: 'done', apts: d.apts ?? [], months: d.months }))
      .catch(e => alive && setState({ status: 'error', apts: [], error: e instanceof Error ? e.message : '조회 실패' }));
    return () => { alive = false; };
  }, [lawd]);
  return state;
}

function AreaPicker({ sido, lawd, onSido, onLawd }: { sido: string; lawd: string; onSido: (s: string) => void; onLawd: (c: string) => void }) {
  return <div className="fields">
    <label>시도 <select value={sido} onChange={e => onSido(e.target.value)}><option value="">선택</option>{SIDO.map(s => <option key={s} value={s}>{s}</option>)}</select></label>
    <label>시군구 <select value={lawd} onChange={e => onLawd(e.target.value)} disabled={!sido}><option value="">선택</option>{sggOf(sido).map(([c, n]) => <option key={c} value={c}>{n}</option>)}</select></label>
  </div>;
}

function AptStatus({ state }: { state: AptState }) {
  if (state.status === 'loading') return <p className="hint loading" role="status"><span className="spinner" aria-hidden="true"/>아파트 검색 중…</p>;
  if (state.status === 'error') return <p role="alert" className="hint">실거래가를 불러오지 못했습니다: {state.error}</p>;
  if (state.status === 'done' && !state.apts.length) return <p className="hint">최근 6개월 동안 이 지역의 아파트 거래가 없습니다.</p>;
  return null;
}

const fmt = (n: number) => Number.isFinite(n) ? Math.round(n).toLocaleString('ko-KR') : '제한 없음';
const kr = (n: number) => Number.isFinite(n) ? (koreanAmount(n) || '0원') : '제한 없음';

function AmountInput({ label, value, onChange, id, unit = '만원' }: { label: string; value: number; onChange: (n: number) => void; id: string; unit?: string }) {
  return <label>{label} <small>{unit}</small>
    <input type="number" min="0" step="100" value={value} onChange={e => onChange(Number(e.target.value))} aria-describedby={id}/>
    <span id={id} className="amount-korean" aria-live="polite">{koreanAmount(value)}</span>
  </label>;
}

export default function FindHome() {
  const [tab, setTab] = useState<'can' | 'want'>('can');
  const [income, setIncome] = useState(6000);
  const [existingAnnual, setExistingAnnual] = useState(0);
  const [cash, setCash] = useState(20000);
  const [rate, setRate] = useState(4.0);
  const [years, setYears] = useState(40);
  const [region, setRegion] = useState<Region>('regulated');
  const [ltv, setLtv] = useState<number>(REGIONS.regulated.ltv);
  const [stress, setStress] = useState<number>(REGIONS.regulated.stress);
  const [manualLoan, setManualLoan] = useState(0);
  const [price, setPrice] = useState(0); // 아파트를 고르거나 직접 입력하기 전에는 결과를 보여주지 않음
  const [over85, setOver85] = useState(false);
  const [sido, setSido] = useState('');
  const [lawd, setLawd] = useState('');
  const [aptKey, setAptKey] = useState('');
  const [area, setArea] = useState('');
  const [aptQuery, setAptQuery] = useState('');
  const aptState = useApts(lawd);
  const onSido = (s: string) => { setSido(s); setLawd(''); setAptKey(''); setArea(''); if (s) changeRegion(regionOfSido(s)); };
  const onLawd = (c: string) => { setLawd(c); setAptKey(''); setArea(''); setAptQuery(''); };
  const aptId = (a: Apt) => `${a.dong}|${a.jibun}|${a.name}`;
  const selectedApt = aptState.apts.find(a => aptId(a) === aptKey);
  const selectedType = selectedApt?.types.find(t => String(t.area) === area);
  const pickType = (a: Apt | undefined, ar: string) => {
    setArea(ar);
    const t = a?.types.find(x => String(x.area) === ar);
    if (t) { setPrice(t.latestPrice); setOver85(t.area > 85); }
  };
  // 검색어로 거르되, 이미 고른 아파트는 목록에 남겨 둠
  const filteredApts = aptState.apts.filter(a => !aptQuery || aptId(a) === aptKey || a.name.includes(aptQuery.trim()) || a.dong.includes(aptQuery.trim()));

  function changeRegion(r: Region) { setRegion(r); setLtv(REGIONS[r].ltv); setStress(REGIONS[r].stress); }
  const inputs: Inputs = { income, existingAnnual, cash, rate, years, region, ltv, stress, dsrLimit: 40 };
  const valid = [income, existingAnnual, cash, rate, ltv, stress, manualLoan, price].every(n => Number.isFinite(n) && n >= 0) && income > 0;

  const canBuy = useMemo(() => {
    if (!valid) return null;
    const auto = maxPrice(inputs);
    const manual = manualLoan > 0 ? cash + manualLoan : 0;
    const top = manual || auto;
    return { auto, manual, top, detail: limits(inputs, top) };
  }, [income, existingAnnual, cash, rate, years, region, ltv, stress, manualLoan, valid]);

  const want = useMemo(() => {
    if (!valid || price <= 0) return null;
    const l = limits(inputs, price);
    const taxRate = acquisitionTaxRate(price, over85);
    const tax = price * taxRate / 100;
    const need = price - l.loan + tax;
    const monthly = monthlyPayment(l.loan, rate, years);
    return { ...l, taxRate, tax, need, shortage: Math.max(0, need - cash), monthly };
  }, [income, existingAnnual, cash, rate, years, region, ltv, stress, price, over85, valid]);

  const common = <>
    <div className="fields">
      <AmountInput label="연소득" value={income} onChange={setIncome} id="fh-income"/>
      <AmountInput label="기존 대출 연간 원리금" value={existingAnnual} onChange={setExistingAnnual} id="fh-existing" unit="만원/년"/>
      <AmountInput label="보유 현금" value={cash} onChange={setCash} id="fh-cash"/>
      <label>대출 금리 <small>연 %</small><input type="number" min="0" step="0.1" value={rate} onChange={e => setRate(Number(e.target.value))}/></label>
      <label>지역 <select value={region} onChange={e => changeRegion(e.target.value as Region)}>{(Object.keys(REGIONS) as Region[]).map(r => <option key={r} value={r}>{REGIONS[r].label}</option>)}</select></label>
      <label>대출기간 <small>년</small><select value={years} onChange={e => setYears(Number(e.target.value))}>{[20, 30, 35, 40, 50].map(y => <option key={y} value={y}>{y}년</option>)}</select></label>
      <label>적용 LTV <small>%</small><input type="number" min="0" max="100" step="5" value={ltv} onChange={e => setLtv(Number(e.target.value))}/></label>
      <label>스트레스 금리 <small>%p</small><input type="number" min="0" step="0.1" value={stress} onChange={e => setStress(Number(e.target.value))}/></label>
    </div>
  </>;

  return <>
    <section className="hero with-illust">
      <div>
        <span className="eyebrow"><MapPin size={15}/> ZIPMOYA HOME FINDER</span>
        <h1>내 집, 어디야?<br/><em>내 예산으로 살 수 있는 아파트</em></h1>
        <p>연봉과 기존 대출, 보유 현금을 입력하면 DSR·LTV 규제를 반영해 살 수 있는 아파트 가격대를 계산하고, 사고 싶은 아파트에 필요한 자금을 알려드려요.</p>
      </div>
      <FindHomeIllustration/>
    </section>

    <section className="section" id="find-home">
      <div className="tabs" role="tablist" aria-label="내 집 찾기 메뉴">
        <button role="tab" aria-selected={tab === 'can'} className={tab === 'can' ? 'active' : ''} onClick={() => setTab('can')}><Search size={17}/> 내가 살 수 있는 아파트</button>
        <button role="tab" aria-selected={tab === 'want'} className={tab === 'want' ? 'active' : ''} onClick={() => setTab('want')}><Home size={17}/> 내가 사고 싶은 아파트</button>
      </div>

      {tab === 'can' ? <><div className="calculator-grid" role="tabpanel">
        <div className="panel">
          <h3><Wallet size={20}/> 내 조건 입력</h3>
          {common}
          <div className="fields stress-stage">
            <AmountInput label="안내받은 대출금액" value={manualLoan} onChange={setManualLoan} id="fh-manual"/>
          </div>
          <p className="hint"><Info size={13} style={{ verticalAlign: 'middle' }}/> 대출금액을 비워 두면(0) DSR 40%·LTV·대출 상한 중 가장 적은 금액으로 자동 계산합니다. 은행에서 한도를 안내받았다면 그 금액을 입력하세요.</p>
        </div>
        <div className="panel result">
          <h3><TrendingDown size={20}/> 내 예산</h3>
          {!canBuy ? <p role="alert">연소득과 입력 금액을 확인해 주세요.</p> : <>
            <div className="main-result"><span>살 수 있는 아파트 최대 가격 (취득세 등 제외)</span><strong>{kr(canBuy.top)}</strong><span>{canBuy.manual ? '입력한 대출금액 + 보유 현금 기준' : `가장 먼저 한도에 걸리는 규제: ${canBuy.detail.binding}`}</span></div>
            <div className="stats">
              <div><span>예상 대출금액</span><strong>{kr(canBuy.manual ? manualLoan : canBuy.detail.loan)}</strong></div>
              <div><span>보유 현금</span><strong>{kr(cash)}</strong></div>
              <div><span>DSR 40% 기준 한도</span><strong>{kr(canBuy.detail.dsrLimit)}</strong></div>
              <div><span>대출 금액 상한</span><strong>{kr(canBuy.detail.cap)}</strong></div>
            </div>
          </>}
        </div>
      </div>
      {canBuy && <div className="panel apt-list-panel">
        <h3><MapPin size={20}/> 이 예산으로 살 수 있는 아파트</h3>
        <AreaPicker sido={sido} lawd={lawd} onSido={onSido} onLawd={onLawd}/>
        <AptStatus state={aptState}/>
        {aptState.status === 'done' && (() => {
          const list = aptState.apts.flatMap(a => a.types.filter(t => t.latestPrice <= canBuy.top).map(t => ({ a, t })))
            .sort((x, y) => y.t.latestPrice - x.t.latestPrice);
          return list.length ? <>
            <p className="hint">최근 6개월 실거래가 기준, {kr(canBuy.top)} 이하로 거래된 {list.length}개 평형 (가격 높은 순, 최대 50개)</p>
            <KakaoMap items={(() => {
              const seen = new Set<string>(); const items: MapItem[] = [];
              for (const { a, t } of list) { const id = aptId(a); if (seen.has(id) || items.length >= 50) continue; seen.add(id); items.push(toMapItem(sido, lawd, a, kr(t.latestPrice).replace('원', ''), `${t.area}㎡ (${pyeong(t.area)}평) · ${t.latestDate} ${kr(t.latestPrice)}`)); }
              return items;
            })()}/>
            <div className="table-scroll"><table className="apt-table">
              <thead><tr><th>아파트</th><th>전용면적</th><th>최근 거래가</th><th>거래일</th><th>거래 수</th></tr></thead>
              <tbody>{list.slice(0, 50).map(({ a, t }) => <tr key={aptId(a) + t.area}><td>{a.name}<small>{a.dong}</small></td><td>{t.area}㎡ ({pyeong(t.area)}평)</td><td>{kr(t.latestPrice)}</td><td>{t.latestDate}</td><td>{t.count}건</td></tr>)}</tbody>
            </table></div>
          </> : <p className="hint">이 지역에서 {kr(canBuy.top)} 이하로 거래된 아파트가 없습니다. 다른 시군구를 선택해 보세요.</p>;
        })()}
        <p className="source">자료: 국토교통부 아파트 매매 실거래가 (해제 거래 제외)</p>
      </div>}
      </> : <div className="calculator-grid" role="tabpanel">
        <div className="panel">
          <h3><Home size={20}/> 사고 싶은 아파트</h3>
          <AreaPicker sido={sido} lawd={lawd} onSido={onSido} onLawd={onLawd}/>
          <AptStatus state={aptState}/>
          {aptState.status === 'done' && aptState.apts.length > 0 && <div className="fields stress-stage">
            <label>아파트 검색 <input type="text" placeholder="아파트명 또는 동" value={aptQuery} onChange={e => setAptQuery(e.target.value)}/></label>
            <label>아파트 <select value={aptKey} onChange={e => { setAptKey(e.target.value); const a = aptState.apts.find(x => aptId(x) === e.target.value); pickType(a, a?.types.length === 1 ? String(a.types[0].area) : ''); }}>
              <option value="">선택 ({filteredApts.length}개)</option>{filteredApts.map(a => <option key={aptId(a)} value={aptId(a)}>{a.name} ({a.dong})</option>)}</select></label>
            {selectedApt && <label>평형 (전용면적) <select value={area} onChange={e => pickType(selectedApt, e.target.value)}>
              <option value="">선택</option>{selectedApt.types.map(t => <option key={t.area} value={String(t.area)}>{t.area}㎡ ({pyeong(t.area)}평) · {t.count}건</option>)}</select></label>}
          </div>}
          {selectedApt && <KakaoMap height={240} items={[toMapItem(sido, lawd, selectedApt, selectedApt.name, `${selectedApt.dong} ${selectedApt.jibun} · ${selectedApt.buildYear}년 준공`)]}/>}
          {selectedApt && selectedType && <p className="apt-picked">{selectedApt.name} {selectedType.area}㎡ · 최근 거래 {selectedType.latestDate} <b>{kr(selectedType.latestPrice)}</b>{selectedType.count > 1 && <> · 6개월 {kr(selectedType.minPrice)}~{kr(selectedType.maxPrice)}</>}</p>}
          <p className="hint">아파트와 평형을 고르면 최근 실거래가가 아래 가격에 자동으로 입력됩니다. 가격은 직접 수정할 수 있습니다.</p>
          <div className="fields">
            <AmountInput label="아파트 가격 (실거래가)" value={price} onChange={setPrice} id="fh-price"/>
            <label>전용면적 <select value={over85 ? 'over' : 'under'} onChange={e => setOver85(e.target.value === 'over')}><option value="under">85㎡ 이하</option><option value="over">85㎡ 초과</option></select></label>
          </div>
          <h3 className="sub-h3"><Wallet size={20}/> 내 조건 입력</h3>
          {common}
        </div>
        <div className="panel result">
          <h3><TrendingDown size={20}/> 필요 자금</h3>
          {price <= 0 ? <div className="empty-result"><Home size={28}/><strong>아파트를 선택해 주세요</strong><p>왼쪽에서 시도·시군구·아파트·평형을 고르면 최근 실거래가로 구매 가능 여부와 필요 자금을 계산합니다. 가격을 직접 입력해도 됩니다.</p></div>
          : !want ? <p role="alert">입력 금액을 확인해 주세요.</p> : <>
            <div className={`verdict ${want.shortage > 0 ? 'no' : 'yes'}`} role="status">
              {want.shortage > 0
                ? <><b>구매 불가능</b><span>보유 현금과 대출을 합쳐도 {kr(want.shortage)}이 부족합니다.</span></>
                : <><b>구매 가능</b><span>보유 현금과 대출로 살 수 있습니다. 남는 현금 약 {kr(cash - want.need)}</span></>}
            </div>
            <div className={`main-result${want.shortage > 0 ? ' short' : ''}`}><span>{want.shortage > 0 ? '보유 현금 외에 더 필요한 자금' : '보유 현금으로 충분합니다'}</span><strong>{want.shortage > 0 ? kr(want.shortage) : '0원'}</strong><span>필요 자금 {kr(want.need)} − 보유 현금 {kr(cash)}</span></div>
            <div className="stats">
              <div><span>대출 가능액 ({want.binding} 기준)</span><strong>{kr(want.loan)}</strong></div>
              <div><span>월 상환액 (원리금균등)</span><strong>{fmt(want.monthly)}만원</strong></div>
              <div><span>취득세 등 ({want.taxRate.toFixed(2)}%)</span><strong>{kr(want.tax)}</strong></div>
              <div><span>필요 자금 (가격 − 대출 + 세금)</span><strong>{kr(want.need)}</strong></div>
            </div>
            <div className="formula">
              <strong>계산식</strong>
              <p><span>대출 가능액 = 가장 적은 금액</span>LTV {ltv}% {kr(want.ltvLimit)} · 대출 상한 {kr(want.cap)} · DSR 40% {kr(want.dsrLimit)} → <b>{kr(want.loan)}</b></p>
              <p><span>필요 자금</span>{kr(price)} − {kr(want.loan)} + 취득세 등 {kr(want.tax)} = <b>{kr(want.need)}</b></p>
            </div>
          </>}
        </div>
      </div>}
    </section>

    <section className="content">
      <h2>계산 기준</h2>
      <div className="info-grid">
        <article><h3>대출 가능액</h3><p>LTV 한도, 지역별 대출 금액 상한, DSR 40% 한도(스트레스 금리 반영) 중 가장 적은 금액입니다. 규제지역은 주택가격 15억 이하 6억, 25억 이하 4억, 초과 2억, 수도권 비규제지역은 6억을 상한으로 가정합니다.</p></article>
        <article><h3>살 수 있는 최대 가격</h3><p>보유 현금 + 대출 가능액이 주택가격 이상이 되는 가장 높은 가격입니다. 취득세, 중개보수, 이사비 등은 포함하지 않았으므로 여유 자금을 따로 준비하세요.</p></article>
        <article><h3>취득세</h3><p>1주택 유상취득 기준입니다. 6억 이하 1%, 6억~9억 1~3%, 9억 초과 3%에 지방교육세(취득세의 10%)를 더하고, 전용 85㎡ 초과는 농어촌특별세 0.2%를 더했습니다.</p></article>
      </div>
      <p className="hint">지역별 LTV, 대출 상한, 스트레스 금리는 대표값이며 생애최초·다주택 여부, 시기, 상품에 따라 달라집니다. 실제 대출 가능 금액은 금융기관 심사로 정해지므로 참고용으로만 사용하세요.</p>
    </section>
  </>;
}
