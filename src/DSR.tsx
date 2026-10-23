import { useMemo, useState } from 'react';
import { Calculator, Info, Wallet, TrendingDown } from 'lucide-react';

/** ZIPMOYA DSR 간이 계산기. 금액 입력 단위: 만원, 금리: 연 %. */
const fmt = (value: number) => Math.round(value).toLocaleString('ko-KR');
const safe = (value: number) => Number.isFinite(value) && value >= 0 ? value : 0;

/** 원리금균등 월 상환액(만원). 금리가 0인 경우도 처리합니다. */
export function monthlyPayment(principal: number, annualRate: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  const n = years * 12;
  const r = annualRate / 1200;
  if (r <= 0) return principal / n;
  return principal * r / (1 - Math.pow(1 + r, -n));
}

/** 월 상환 가능액을 원리금균등 대출원금으로 역산합니다(만원). */
export function loanFromMonthlyPayment(payment: number, annualRate: number, years: number): number {
  if (payment <= 0 || years <= 0) return 0;
  const n = years * 12;
  const r = annualRate / 1200;
  if (r <= 0) return payment * n;
  return payment * (1 - Math.pow(1 + r, -n)) / r;
}

/**
 * 스트레스 DSR 단계별 대표값. 금융당국 발표에 따라 바뀌므로 화면에서 직접 수정할 수 있습니다.
 * - rate: 지역별 적용 스트레스 금리(%p). 기본 스트레스 금리 1.5%p에 단계별 적용률(25%·50%·100%)을 곱한 값이며,
 *   2단계 수도권(은행권 주담대)은 1.2%p, 3단계 수도권·규제지역 주담대는 3.0%p(2025.10.15 대책 하한)입니다.
 * - ratio: 금리유형별 반영비율(%) 대표값. 실제 비율은 고정기간·주기와 만기에 따라 달라집니다.
 */
export const STRESS_STAGES = {
  '1': { label:'1단계', rate:{ capital:0.38, local:0.38 }, ratio:{ variable:100, mixed:60, periodic:30, fixed:0 } },
  '2': { label:'2단계', rate:{ capital:1.2, local:0.75 }, ratio:{ variable:100, mixed:60, periodic:30, fixed:0 } },
  '3': { label:'3단계', rate:{ capital:3.0, local:1.5 }, ratio:{ variable:100, mixed:80, periodic:40, fixed:0 } },
} as const;
type Stage = 'none' | keyof typeof STRESS_STAGES;
type Region = 'capital' | 'local';
type RateType = 'variable' | 'mixed' | 'periodic' | 'fixed';
const REGION_LABEL: Record<Region,string> = { capital:'수도권·규제지역', local:'지방' };
const RATE_TYPE_LABEL: Record<RateType,string> = { variable:'변동형', mixed:'혼합형', periodic:'주기형', fixed:'완전 고정형' };

export default function DSR() {
  const [income, setIncome] = useState(8000);
  const [existingAnnual, setExistingAnnual] = useState(0);
  const [newLoan, setNewLoan] = useState(30000);
  const [rate, setRate] = useState(4.3);
  const [stage, setStage] = useState<Stage>('3');
  const [region, setRegion] = useState<Region>('capital');
  const [rateType, setRateType] = useState<RateType>('variable');
  const [stressBase, setStressBase] = useState<number>(STRESS_STAGES['3'].rate.capital);
  const [ratio, setRatio] = useState<number>(STRESS_STAGES['3'].ratio.variable);
  /** 단계·지역·금리유형을 바꾸면 대표값을 다시 채웁니다. */
  const applyPreset = (st: Stage, rg: Region, rt: RateType) => {
    setStage(st); setRegion(rg); setRateType(rt);
    if (st !== 'none') { setStressBase(STRESS_STAGES[st].rate[rg]); setRatio(STRESS_STAGES[st].ratio[rt]); }
  };
  const stressOn = stage !== 'none';
  const stressRate = stressOn ? safe(stressBase) * safe(ratio) / 100 : 0;
  const [years, setYears] = useState(40);
  const [limit, setLimit] = useState(40);

  const valid = income > 0 && years > 0 && rate >= 0 && stressBase >= 0 && ratio >= 0 && ratio <= 100 &&
    existingAnnual >= 0 && newLoan >= 0 && Number.isFinite(income + existingAnnual + newLoan + rate + stressRate);

  const result = useMemo(() => {
    const effectiveRate = safe(rate) + safe(stressRate);
    const newMonthly = monthlyPayment(safe(newLoan), effectiveRate, years);
    const annualNew = newMonthly * 12;
    const annualTotal = annualNew + safe(existingAnnual);
    const dsr = income > 0 ? (annualTotal / income) * 100 : 0;
    const allowedAnnual = Math.max(0, (safe(income) * limit / 100) - safe(existingAnnual));
    const maxLoan = loanFromMonthlyPayment(allowedAnnual / 12, effectiveRate, years);
    const remainingAnnual = Math.max(0, safe(income) * limit / 100 - annualTotal);
    return { effectiveRate, newMonthly, annualNew, annualTotal, dsr, allowedAnnual, maxLoan, remainingAnnual };
  }, [income, existingAnnual, newLoan, rate, stressRate, years, limit]);

  return <>
    <section className="hero">
      <span className="eyebrow"><Calculator size={15}/> ZIPMOYA DSR CALCULATOR</span>
      <h1>DSR 계산기<br/><em>연봉으로 대출한도 확인하기</em></h1>
      <p>연소득과 기존 대출의 연간 원리금 상환액을 입력하면 DSR 비율과 신규 대출 가능액을 간이 계산합니다.</p>
    </section>
    <section className="section" id="dsr-calculator">
      <div className="section-heading"><h2>총부채원리금상환비율(DSR) 계산기</h2><p>연소득과 기존 대출 상환액을 바탕으로 DSR 비율과 신규 대출 가능액을 계산합니다.</p></div>
      <div className="calculator-grid">
        <div className="panel">
          <h3><Wallet size={20}/> 대출 조건 입력</h3>
          <div className="fields">
            <label>연소득 <small>만원</small><input type="number" min="1" value={income} onChange={e => setIncome(Number(e.target.value))}/></label>
            <label>기존 대출 연간 원리금 <small>만원/년</small><input type="number" min="0" value={existingAnnual} onChange={e => setExistingAnnual(Number(e.target.value))}/></label>
            <label>신규 대출 희망금액 <small>만원</small><input type="number" min="0" value={newLoan} onChange={e => setNewLoan(Number(e.target.value))}/></label>
            <label>신규 대출금리 <small>연 %</small><input type="number" min="0" step="0.1" value={rate} onChange={e => setRate(Number(e.target.value))}/></label>
            <label>대출기간 <small>년</small><select value={years} onChange={e => setYears(Number(e.target.value))}>{[10,15,20,25,30,35,40,45,50].map(y => <option value={y} key={y}>{y}년</option>)}</select></label>
            <label>적용 DSR 기준 <small>%</small><select value={limit} onChange={e => setLimit(Number(e.target.value))}><option value={40}>40%</option><option value={50}>50%</option></select></label>
          </div>
          <div className="fields stress-stage">
            <label>스트레스 DSR <select value={stage} onChange={e => applyPreset(e.target.value as Stage, region, rateType)}><option value="none">없음</option>{(Object.keys(STRESS_STAGES) as (keyof typeof STRESS_STAGES)[]).map(k => <option key={k} value={k}>{STRESS_STAGES[k].label}</option>)}</select></label>
          </div>
          {stressOn && <div className="fields stress-fields">
            <label>지역 <select value={region} onChange={e => applyPreset(stage, e.target.value as Region, rateType)}>{(Object.keys(REGION_LABEL) as Region[]).map(r => <option key={r} value={r}>{REGION_LABEL[r]}</option>)}</select></label>
            <label>스트레스 금리 <small>%p</small><input type="number" min="0" step="0.05" value={stressBase} onChange={e => setStressBase(Number(e.target.value))}/></label>
            <label>금리 유형 <select value={rateType} onChange={e => applyPreset(stage, region, e.target.value as RateType)}>{(Object.keys(RATE_TYPE_LABEL) as RateType[]).map(t => <option key={t} value={t}>{RATE_TYPE_LABEL[t]}</option>)}</select></label>
            <label>반영 비율 <small>%</small><input type="number" min="0" max="100" step="10" value={ratio} onChange={e => setRatio(Number(e.target.value))}/></label>
          </div>}
          <p className="hint"><Info size={13} style={{verticalAlign:'middle'}}/> 기존 대출 연간 원리금은 모든 기존 대출의 연간 상환액을 합산하여 입력하세요. 스트레스 금리는 실제 이자에는 붙지 않고 한도 심사에만 쓰이는 가산금리입니다. 기본값은 대표값이므로 실제 적용 수치는 은행에서 확인해 수정하세요.</p>
        </div>
        <div className="panel result">
          <h3><TrendingDown size={20}/> 예상 DSR 결과</h3>
          {!valid ? <p role="alert">연소득과 입력 금액을 확인해 주세요. 음수는 입력할 수 없습니다.</p> : <>
            <div className="main-result"><span>예상 DSR 비율</span><strong>{result.dsr.toFixed(2)}<small>%</small></strong><span>선택한 {limit}% 기준 대비 {result.dsr <= limit ? '기준 이내' : '기준 초과'} · 심사용 금리 {result.effectiveRate.toFixed(2)}%</span></div>
            <div className="stats">
              <div><span>DSR 기준 예상 신규 대출한도</span><strong>{fmt(result.maxLoan)}만원</strong></div>
              <div><span>희망 대출 월 상환액(심사용)</span><strong>{fmt(result.newMonthly)}만원</strong></div>
              <div><span>연간 총 원리금(심사용)</span><strong>{fmt(result.annualTotal)}만원</strong></div>
              <div><span>DSR 기준 잔여 연간 상환여력</span><strong>{fmt(result.remainingAnnual)}만원</strong></div>
            </div>
            <div className="bar" aria-label={`DSR 기준 사용률 ${Math.min(100, result.dsr / limit * 100).toFixed(0)}%`}><span style={{width:`${Math.min(100, result.dsr / limit * 100)}%`}}/></div>
            <div className="formula" aria-label="계산식">
              <strong>계산식</strong>
              <p><span>① 심사용 금리</span>{stressOn
                ? <>대출금리 {rate.toFixed(2)}% + 스트레스 금리 {safe(stressBase).toFixed(2)}%p({STRESS_STAGES[stage].label}·{REGION_LABEL[region]}) × 반영비율 {safe(ratio)}%({RATE_TYPE_LABEL[rateType]})<br/>= {rate.toFixed(2)}% + {safe(stressRate).toFixed(2)}%p = <b>{result.effectiveRate.toFixed(2)}%</b></>
                : <>{rate.toFixed(2)}% (스트레스 DSR 미적용) = <b>{result.effectiveRate.toFixed(2)}%</b></>}</p>
              <p><span>② 신규 대출 연간 원리금</span>월 {result.newMonthly.toLocaleString('ko-KR',{maximumFractionDigits:1})}만원 × 12 = <b>{fmt(result.annualNew)}만원</b></p>
              <p><span>③ DSR</span>({fmt(safe(existingAnnual))} + {fmt(result.annualNew)}) ÷ {fmt(income)} × 100 = <b>{result.dsr.toFixed(2)}%</b></p>
              <p><span>④ 대출한도</span>(연소득 × {limit}% − 기존 원리금) = 연 {fmt(result.allowedAnnual)}만원 상환 가능 → 원금 환산 <b>{fmt(result.maxLoan)}만원</b></p>
            </div>
            <p className="hint">선택한 DSR 기준 {limit}%에 대한 비율을 표시합니다. {result.dsr > limit ? '현재 입력한 신규 대출 희망금액은 선택 기준을 초과합니다.' : '현재 입력한 신규 대출 희망금액은 선택 기준 이내입니다.'}</p>
          </>}
        </div>
      </div>
    </section>
    <section className="content">
      <h2>DSR 계산 방법</h2>
      <div className="info-grid">
        <article><h3>DSR이란?</h3><p>DSR(총부채원리금상환비율)은 연소득 대비 모든 대출의 연간 원금과 이자 상환액이 차지하는 비율입니다.</p></article>
        <article><h3>계산식</h3><p>DSR(%) = (기존 대출 연간 원리금 + 신규 대출 연간 원리금) ÷ 연소득 × 100</p><p>월 원리금 = 대출원금 × r ÷ (1 − (1 + r)<sup>−n</sup>)<br/>r = 심사용 금리 ÷ 12, n = 대출기간(개월)</p></article>
        <article><h3>스트레스 DSR</h3><p>심사용 금리 = 대출금리 + 스트레스 금리 × 금리유형별 반영비율</p><p>스트레스 금리는 기본 1.5%p에 단계별 적용률을 곱합니다. 1단계 25%(0.38%p), 2단계 50%(0.75%p, 수도권 은행권 주담대 1.2%p), 3단계 100%(1.5%p, 수도권·규제지역 주담대 3.0%p).</p><p>금리 상승 위험을 반영해 한도를 계산할 때만 금리를 높여 잡는 제도입니다. 변동형은 100% 반영되고, 혼합형·주기형은 고정 기간이 길수록 반영비율이 낮아지며, 완전 고정형은 반영되지 않습니다.</p></article>
      </div>
      <h2>계산 결과 유의사항</h2>
      <p className="hint">이 도구는 신규 대출을 <strong>원리금균등상환</strong>으로 가정한 간이 시뮬레이터입니다. 기존 대출의 실제 DSR 인정 상환액, 신용대출 산정만기, 스트레스 DSR 세부 규정, DSR 예외 대출, LTV, 지역·상품별 한도, 금융기관 내부 심사 기준은 자동 반영하지 않습니다. 40%·50%는 선택 가능한 비교용 가정이며 실제 적용 기준을 뜻하지 않습니다. 표시된 한도는 대출 승인 또는 실제 가능 금액을 보장하지 않습니다.</p>
    </section>
  </>;
}
