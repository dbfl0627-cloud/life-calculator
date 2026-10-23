import { koreanAmount } from './format';

/**
 * AI 검색·검색엔진이 바로 인용할 수 있는 예시 표.
 * 숫자는 빌드할 때 아래 가정값으로 직접 계산하므로 공식이 바뀌면 표도 함께 바뀝니다.
 */
export const INFO_UPDATED = '2026-10-24';
export const INFO_UPDATED_LABEL = '2026년 10월 24일';
const RATE = 4.0;

/** 원리금균등 월 상환액(만원) */
function payment(principal: number, annualRate: number, years: number) {
  const n = years * 12, r = annualRate / 1200;
  return r === 0 ? principal / n : principal * r / (1 - Math.pow(1 + r, -n));
}
/** 월 상환 가능액 → 원리금균등 대출원금(만원) */
function principalFrom(monthly: number, annualRate: number, years: number) {
  const n = years * 12, r = annualRate / 1200;
  return r === 0 ? monthly * n : monthly * (1 - Math.pow(1 + r, -n)) / r;
}
const won = (man: number) => Math.round(man * 10000).toLocaleString('ko-KR') + '원';
/** 만원 단위를 100만원 단위로 내림해 "약 3억 2천만원"처럼 표시 */
const approx = (man: number) => '약 ' + koreanAmount(Math.floor(man / 100) * 100);

export function UpdatedNote() {
  return <p className="updated">정보 기준일: <time dateTime={INFO_UPDATED}>{INFO_UPDATED_LABEL}</time></p>;
}

export function MortgageExamples() {
  const amounts = [10000, 20000, 30000, 40000, 50000];
  const terms = [20, 30, 40];
  return <>
    <h2>대출금액별 월 상환액 예시</h2>
    <p className="lead">연 {RATE.toFixed(1)}% 금리, 원리금균등상환, 거치기간 없음 기준으로 계산한 주택담보대출 월 상환액입니다. 예를 들어 3억원을 30년 동안 빌리면 매달 약 {won(payment(30000, RATE, 30))}을 갚습니다.</p>
    <div className="table-scroll example-table"><table>
      <caption>대출금액·기간별 월 상환액 (연 {RATE.toFixed(1)}%, 원리금균등)</caption>
      <thead><tr><th>대출금액</th>{terms.map(t => <th key={t}>{t}년</th>)}</tr></thead>
      <tbody>{amounts.map(a => <tr key={a}><td>{koreanAmount(a)}</td>{terms.map(t => <td key={t}>{won(payment(a, RATE, t))}</td>)}</tr>)}</tbody>
    </table></div>
  </>;
}

export function DsrExamples() {
  const incomes = [3000, 4000, 5000, 6000, 8000, 10000];
  const cases = [
    { label: '스트레스 DSR 미적용', add: 0 },
    { label: '3단계·지방 변동형 (+1.5%p)', add: 1.5 },
    { label: '3단계·수도권 변동형 (+3.0%p)', add: 3.0 },
  ];
  const limit = (income: number, add: number) => principalFrom(income * 0.4 / 12, RATE + add, 40);
  return <>
    <h2>연봉별 DSR 40% 대출한도 예시</h2>
    <p className="lead">기존 대출이 없고, 신규 주택담보대출 금리 연 {RATE.toFixed(1)}%, 40년 원리금균등상환, DSR 40% 기준으로 계산한 대출한도입니다. 예를 들어 연봉 5천만원이면 스트레스 DSR 미적용 시 {approx(limit(5000, 0))}, 수도권 변동형(3단계) 적용 시 {approx(limit(5000, 3.0))}까지 가능한 것으로 계산됩니다.</p>
    <div className="table-scroll example-table"><table>
      <caption>연소득별 DSR 40% 기준 대출한도 (연 {RATE.toFixed(1)}%, 40년)</caption>
      <thead><tr><th>연소득</th>{cases.map(c => <th key={c.label}>{c.label}</th>)}</tr></thead>
      <tbody>{incomes.map(i => <tr key={i}><td>{koreanAmount(i)}</td>{cases.map(c => <td key={c.label}>{approx(limit(i, c.add))}</td>)}</tr>)}</tbody>
    </table></div>
    <p className="hint">스트레스 금리는 한도 계산에만 쓰이며 실제 이자에는 붙지 않습니다. 스트레스 DSR 단계·지역별 수치는 <a href="https://www.fsc.go.kr" target="_blank" rel="noopener noreferrer">금융위원회</a> 발표를 바탕으로 한 대표값이며, 실제 한도는 은행 심사와 LTV 등 다른 규제에 따라 달라집니다.</p>
  </>;
}

export function LtvExamples() {
  const prices = [30000, 50000, 80000, 100000, 150000];
  const ratios = [40, 50, 70];
  return <>
    <h2>집값별 LTV 대출한도 예시</h2>
    <p className="lead">기존 담보대출이 없을 때 주택가격과 LTV 비율만으로 계산한 담보가치 기준 최대 대출액입니다. 예를 들어 8억원 주택에 LTV 70%가 적용되면 최대 5억 6천만원까지 계산됩니다.</p>
    <div className="table-scroll example-table"><table>
      <caption>주택가격·LTV 비율별 담보가치 기준 대출한도</caption>
      <thead><tr><th>주택가격</th>{ratios.map(r => <th key={r}>LTV {r}%</th>)}</tr></thead>
      <tbody>{prices.map(p => <tr key={p}><td>{koreanAmount(p)}</td>{ratios.map(r => <td key={r}>{koreanAmount(p * r / 100)}</td>)}</tr>)}</tbody>
    </table></div>
    <p className="hint">실제로는 DSR, 지역별 대출금액 상한(예: 수도권·규제지역 주택가격 구간별 상한), 방공제 등이 함께 적용되어 위 금액보다 적을 수 있습니다.</p>
  </>;
}
