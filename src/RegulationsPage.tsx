import type React from 'react';
import { Scale, ChevronRight, MapPin, Percent, Home } from 'lucide-react';
import { REG_CHECKED, REG_CHECKED_LABEL, REGION_RULES, DSR_RULES, REGULATED_GYEONGGI, REG_HISTORY, type RegionKey } from './regulations';
import { koreanAmount } from './format';

type LinkProps = (path: string) => { href: string; onClick: (e: React.MouseEvent) => void };
const kr = (man: number) => koreanAmount(man);
const ORDER: RegionKey[] = ['regulated', 'capital', 'local'];
const dateLabel = (d: string) => { const [y, m, day] = d.split('-'); return `${y}년 ${Number(m)}월 ${Number(day)}일`; };

/** 지금 적용 중인 주택담보대출 규제를 한 페이지에 모은 '규제 총정리'. 수치는 src/regulations.ts에서 가져옵니다. */
export function Regulations({ link }: { link: LinkProps }) {
  const capRows = REGION_RULES.regulated.caps;
  return <article className="article guide regulations">
    <span className="eyebrow"><Scale size={15}/> ZIPMOYA REGULATIONS</span>
    <h1>주택담보대출 규제 총정리</h1>
    <p className="guide-meta">최종 확인일 <time dateTime={REG_CHECKED}>{REG_CHECKED_LABEL}</time> · 새 규제가 나오면 이 페이지를 갱신합니다</p>
    <p className="guide-summary">지금 적용 중인 지역별 LTV, 주택가격별 대출 한도, DSR과 스트레스 금리, 규제지역 목록과 최근 변경 이력을 한곳에 정리했습니다. ZIPMOYA의 계산기와 내 집 찾기도 이 기준을 기본값으로 씁니다.</p>

    <h2>1. 지역별 LTV (주택담보인정비율)</h2>
    <div className="table-scroll example-table"><table>
      <thead><tr><th>지역</th><th>무주택자</th><th>생애최초</th><th>비고</th></tr></thead>
      <tbody>{ORDER.map(r => { const x = REGION_RULES[r]; return <tr key={r}><td>{x.label}</td><td>{x.ltv}%</td><td>{x.ltvFirstTime}%</td><td>{x.note}</td></tr>; })}</tbody>
    </table></div>
    <p className="hint">무주택자에는 기존 주택을 일정 기간 안에 처분하기로 약정한 처분조건부 1주택자가 포함됩니다. 생애최초 LTV는 실거주(전입) 조건이 붙습니다.</p>

    <h2>2. 주택가격별 대출 한도 (수도권·규제지역)</h2>
    <div className="table-scroll example-table"><table>
      <thead><tr><th>주택 시가</th><th>최대 주택담보대출</th></tr></thead>
      <tbody>{capRows.map((c, i) => <tr key={i}><td>{i === 0 ? `${kr(c.upTo)} 이하` : Number.isFinite(c.upTo) ? `${kr(capRows[i - 1].upTo)} 초과 ~ ${kr(c.upTo)} 이하` : `${kr(capRows[i - 1].upTo)} 초과`}</td><td>{kr(c.cap)}</td></tr>)}</tbody>
    </table></div>
    <p className="hint">실제 대출은 LTV로 계산한 금액과 위 한도 중 적은 금액이며, 그 뒤 DSR 심사를 통과해야 합니다. 지방(비수도권)은 금액 한도 없이 LTV·DSR로만 정해집니다.</p>

    <h2>3. DSR과 스트레스 금리</h2>
    <div className="table-scroll example-table"><table>
      <thead><tr><th>항목</th><th>기준</th></tr></thead>
      <tbody>
        <tr><td>DSR 한도</td><td>은행 {DSR_RULES.bank}% · 제2금융권 {DSR_RULES.nonBank}% (총대출 {kr(DSR_RULES.appliesOver)} 초과 시)</td></tr>
        {ORDER.map(r => <tr key={r}><td>스트레스 금리 · {REGION_RULES[r].short}</td><td>+{REGION_RULES[r].stress}%p (변동금리 기준, 고정 기간이 길수록 낮게 반영)</td></tr>)}
        <tr><td>최장 만기</td><td>수도권·규제지역 주담대 {REGION_RULES.regulated.maxYears}년 · 지방은 상품별</td></tr>
      </tbody>
    </table></div>
    <p className="hint">스트레스 금리는 대출 한도를 계산할 때만 더해지고 실제 이자에는 붙지 않습니다. 자세한 원리는 <a href="/guide/stress-dsr/">스트레스 DSR 가이드</a>를 참고하세요.</p>

    <h2>4. 규제지역 목록</h2>
    <ul className="reg-areas">
      <li><strong>서울특별시</strong> 전역 (25개 구)</li>
      <li><strong>경기도</strong> {Object.values(REGULATED_GYEONGGI).join(', ')}</li>
    </ul>
    <p className="hint">규제지역(조정대상지역·투기과열지구)과 토지거래허가구역으로 함께 지정되어, 아파트 등은 취득 후 실거주 의무가 있습니다.</p>

    <h2>5. 최근 변경 이력</h2>
    <ol className="reg-history">{[...REG_HISTORY].sort((a, b) => b.date.localeCompare(a.date)).map(h => <li key={h.date + h.title}>
      <time dateTime={h.date}>{dateLabel(h.date)}</time>
      <strong>{h.title}</strong>
      <p>{h.detail}</p>
      <span className="reg-src">출처: {h.sources.map((s, i) => <span key={s.url}>{i > 0 && ', '}<a href={s.url} target="_blank" rel="noopener noreferrer nofollow">{s.title}</a></span>)}</span>
    </li>)}</ol>

    <p className="hint">이 페이지는 공개된 정부 발표와 언론 보도를 바탕으로 정리한 참고 자료입니다. 상품·차주 조건에 따라 예외가 있으니 실제 대출 전 금융기관에서 최신 기준을 확인하세요.</p>
    <h2 className="guide-sub">이 기준으로 계산해 보기</h2>
    <div className="guide-tools">
      <a className="primary" {...link('/find-home/')}><MapPin size={17}/> 내 집 찾기 <ChevronRight size={16}/></a>
      <a className="primary" {...link('/dsr/')}><Percent size={17}/> DSR 계산기 <ChevronRight size={16}/></a>
      <a className="primary" {...link('/ltv/')}><Home size={17}/> LTV 계산기 <ChevronRight size={16}/></a>
    </div>
  </article>;
}
