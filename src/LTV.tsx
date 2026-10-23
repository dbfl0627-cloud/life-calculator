import { useMemo, useState } from 'react';
import { Calculator, Home, Info, TrendingDown, Wallet } from 'lucide-react';
import { LtvIllustration } from './Illustrations';
import { LTV_FAQ } from './faq';
import { koreanAmount } from './format';

/** ZIPMOYA LTV 간이 계산기. 금액 단위: 만원. */
const fmt = (n: number) => Math.round(n).toLocaleString('ko-KR');
const validNumber = (n: number) => Number.isFinite(n) && n >= 0;

export type LtvResult = {
  collateralLimit: number;
  additionalLimit: number;
  availableFunds: number;
  purchaseGap: number;
  actualLtv: number;
};

/** 담보가치와 LTV만으로 산정한 단순 추정치. DSR·방공제·상품별 상한 미반영. */
export function calculateLtv(
  homePrice: number,
  ltvPercent: number,
  existingSecuredLoan: number,
  ownFunds: number,
): LtvResult {
  if (![homePrice, ltvPercent, existingSecuredLoan, ownFunds].every(validNumber) || homePrice <= 0 || ltvPercent > 100) {
    throw new Error('입력값을 확인해 주세요.');
  }
  const collateralLimit = homePrice * ltvPercent / 100;
  const additionalLimit = Math.max(0, collateralLimit - existingSecuredLoan);
  const availableFunds = ownFunds + additionalLimit;
  const purchaseGap = Math.max(0, homePrice - availableFunds);
  const actualLtv = (existingSecuredLoan + additionalLimit) / homePrice * 100;
  return { collateralLimit, additionalLimit, availableFunds, purchaseGap, actualLtv };
}

export default function LTV() {
  const [homePrice, setHomePrice] = useState(80000);
  const [ltvPercent, setLtvPercent] = useState(70);
  const [existingLoan, setExistingLoan] = useState(0);
  const [ownFunds, setOwnFunds] = useState(20000);

  const valid = homePrice > 0 && ltvPercent >= 0 && ltvPercent <= 100 &&
    [homePrice, ltvPercent, existingLoan, ownFunds].every(validNumber);
  const result = useMemo(() => {
    if (!valid) return null;
    return calculateLtv(homePrice, ltvPercent, existingLoan, ownFunds);
  }, [homePrice, ltvPercent, existingLoan, ownFunds, valid]);

  return <>
    <section className="hero with-illust">
      <div>
      <span className="eyebrow"><Calculator size={15}/> ZIPMOYA LTV CALCULATOR</span>
      <h1>LTV 계산기<br/><em>집값으로 담보대출 한도 확인하기</em></h1>
      <p>주택가격과 적용할 LTV 비율을 입력해 담보가치 기준 예상 대출한도와 필요한 추가 자금을 계산해 보세요.</p>
      <button className="primary" onClick={() => document.getElementById('ltv-calculator')?.scrollIntoView({ behavior: 'smooth' })}>지금 계산하기</button>
      </div>
      <LtvIllustration/>
    </section>

    <section className="section" id="ltv-calculator">
      <div className="section-heading"><div><span className="eyebrow">LTV CALCULATOR</span><h2>주택담보인정비율(LTV) 계산기</h2><p>비율은 자동 판정하지 않으며, 실제 적용 가능한 LTV를 직접 선택합니다.</p></div></div>
      <div className="calculator-grid">
        <div className="panel">
          <h3><Wallet size={20}/> 주택 및 대출 조건 입력</h3>
          <div className="fields">
            <label>주택가격 / 담보평가액 <small>만원</small>
              <input type="number" min="1" step="100" value={homePrice} onChange={e => setHomePrice(Number(e.target.value))} aria-describedby="ltv-price-kr"/><span id="ltv-price-kr" className="amount-korean" aria-live="polite">{koreanAmount(homePrice)}</span>
            </label>
            <label>적용 LTV 비율 <small>%</small>
              <select value={ltvPercent} onChange={e => setLtvPercent(Number(e.target.value))}>
                {[0, 30, 40, 50, 60, 70, 80, 90, 100].map(v => <option key={v} value={v}>{v}%</option>)}
              </select>
            </label>
            <label>기존 담보대출 잔액 <small>만원</small>
              <input type="number" min="0" step="100" value={existingLoan} onChange={e => setExistingLoan(Number(e.target.value))} aria-describedby="ltv-existing-kr"/><span id="ltv-existing-kr" className="amount-korean" aria-live="polite">{koreanAmount(existingLoan)}</span>
            </label>
            <label>보유 현금 <small>만원</small>
              <input type="number" min="0" step="100" value={ownFunds} onChange={e => setOwnFunds(Number(e.target.value))} aria-describedby="ltv-funds-kr"/><span id="ltv-funds-kr" className="amount-korean" aria-live="polite">{koreanAmount(ownFunds)}</span>
            </label>
          </div>
          <p className="hint"><Info size={13} style={{ verticalAlign: 'middle' }}/> LTV 비율은 지역·주택·차주·대출 목적·상품에 따라 달라질 수 있습니다. 실제 적용 비율을 확인하여 선택하세요.</p>
        </div>

        <div className="panel result">
          <h3><TrendingDown size={20}/> 예상 LTV 계산 결과</h3>
          {!result ? <p role="alert">주택가격, LTV 비율, 대출잔액 및 보유 현금을 확인해 주세요.</p> : <>
            <div className="main-result">
              <span>담보가치 기준 최대 대출액</span>
              <strong>{fmt(result.collateralLimit)}<small>만원</small></strong>
              <span>주택가격 {fmt(homePrice)}만원 × LTV {ltvPercent}%</span>
            </div>
            <div className="stats">
              <div><span>기존 대출 차감 후 추가 한도</span><strong>{fmt(result.additionalLimit)}만원</strong></div>
              <div><span>보유 현금 + 추가 한도</span><strong>{fmt(result.availableFunds)}만원</strong></div>
              <div><span>주택가격 대비 부족 자금</span><strong>{fmt(result.purchaseGap)}만원</strong></div>
              <div><span>기존 대출 포함 추정 담보대출 비율</span><strong>{result.actualLtv.toFixed(1)}%</strong></div>
            </div>
            <div className="bar" aria-label={`담보대출 추정 비율 ${result.actualLtv.toFixed(1)}%`}>
              <span style={{ width: `${Math.min(100, result.actualLtv)}%` }}/>
            </div>
            <p className="hint">부족 자금은 주택가격과 보유 현금·추가 대출한도만 비교한 금액입니다. 취득세·중개보수·등기비용 등은 별도입니다.</p>
            {existingLoan > result.collateralLimit && <p role="alert">기존 담보대출 잔액이 선택한 LTV 기준 한도를 초과합니다. 추가 대출 가능액은 0원으로 표시됩니다.</p>}
          </>}
        </div>
      </div>
    </section>

    <section className="content">
      <h2>LTV 계산 방법</h2>
      <p className="lead">LTV(Loan To Value)는 담보로 인정되는 주택가격 대비 주택담보대출 금액의 비율입니다. 이 계산기는 선택한 LTV 비율을 바탕으로 단순 담보한도를 산정합니다.</p>
      <div className="info-grid">
        <article><h3><Home size={18}/> LTV란?</h3><p>담보가치 8억원에 LTV 70%를 적용하면 단순 담보한도는 5억 6,000만원입니다.</p></article>
        <article><h3>계산식</h3><p>담보가치 기준 한도 = 주택가격 × LTV 비율. 추가 한도 = 최대(0, 담보한도 − 기존 담보대출 잔액).</p></article>
        <article><h3>DSR과 차이</h3><p>LTV는 담보가치 기준이고, DSR은 소득 대비 원리금 상환능력 기준입니다. 실제 대출한도는 두 기준을 비롯한 여러 규제를 함께 검토해야 합니다.</p></article>
      </div>
      <h2>자주 묻는 질문</h2>
      {LTV_FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
      <h2>계산 결과 유의사항</h2>
      <p className="hint">이 계산기는 참고용 간이 시뮬레이터입니다. 지역별·시기별 규제, 주택가격 산정 방식, DSR 및 스트레스 DSR, 대출금액 절대 상한, 선순위채권, 임차보증금·최우선변제금 공제(방공제), MCI·MCG 적용 여부, 금융기관별 심사와 상품 요건은 자동 반영하지 않습니다. 기존 담보대출 잔액은 동일 담보의 한도를 차감하는 것으로 단순 가정하며, 실제 선순위채권 인정액과 다를 수 있습니다. 보유 현금과 추가 한도를 합한 값은 실제 매수 가능 자금이나 대출 승인을 보장하지 않습니다.</p>
    </section>
  </>;
}
