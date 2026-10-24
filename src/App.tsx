import React, {useMemo,useState} from 'react';
import {Calculator, ShieldCheck, ChevronRight, Wallet, CalendarDays, TrendingDown} from 'lucide-react';
import {calculateLoan, type Method} from './calc';
import {normalizePath, applyMeta} from './routes';
import {koreanAmount} from './format';
import {FAQ} from './faq';
import {Privacy} from './Privacy';
import DSR from './DSR';
import LTV from './LTV';
import FindHome from './FindHome';
import {GuideList, GuideArticle} from './Guide';
import {About} from './About';
import {MortgageIllustration} from './Illustrations';
import {RelatedTools, NotFound} from './RelatedTools';
import {ROUTES} from './routes';
import {MortgageExamples, UpdatedNote} from './Examples';
const money=(n:number)=>Math.round(n).toLocaleString('ko-KR');
export function App({initialPath}:{initialPath:string}){
 const [page,setPage]=useState(normalizePath(initialPath));
 const [amount,setAmount]=useState(39000),[rate,setRate]=useState(4.3),[years,setYears]=useState(40),[grace,setGrace]=useState(0),[method,setMethod]=useState<Method>('equal-payment');
 const [expanded,setExpanded]=useState(false);
 // 현재 페이지 메뉴를 진하게 표시 (/mortgage/는 홈과 같은 화면)
 const current=page==='/mortgage/'?'/':page;
 const navLink=(p:string)=>({...link(p),className:current===p?'active':undefined,'aria-current':current===p?'page' as const:undefined});
 // 본문 안의 일반 <a href="/..."> 링크도 페이지 새로고침 없이 이동
 const onMainClick=(e:React.MouseEvent)=>{const a=(e.target as HTMLElement).closest('a');if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target)return;const href=a.getAttribute('href');if(href&&href.startsWith('/')&&!href.startsWith('//')){e.preventDefault();go(href)}};
 const isKnown=page in ROUTES;
 const link=(p:string)=>({href:p,onClick:(e:React.MouseEvent)=>{e.preventDefault();go(p)}});
 const go=(p:string)=>{history.pushState(null,'',p);setPage(p);applyMeta(p);scrollTo(0,0)};
 React.useEffect(()=>{const f=()=>{const p=normalizePath(location.pathname);setPage(p);applyMeta(p)};window.addEventListener('popstate',f);return()=>window.removeEventListener('popstate',f)},[]);
 const rows=useMemo(()=>{try{return calculateLoan(amount*10000,rate,years,grace,method)}catch{return []}},[amount,rate,years,grace,method]);
 const totalInterest=rows.reduce((s,r)=>s+r.interest,0),total=rows.reduce((s,r)=>s+r.payment,0);
 const firstRepayment=rows.find(r=>!r.grace)?.payment??0;
 return <><header><div className="wrap head"><a className="brand" {...link('/')}><span className="brand-icon"><Calculator size={21}/></span> ZIPMOYA</a><nav><a {...navLink('/find-home/')}>내 집 찾기</a><a {...navLink('/')}>주담대 계산기</a><a {...navLink('/dsr/')}>DSR 계산기</a><a {...navLink('/ltv/')}>LTV 계산기</a><a {...navLink('/guide/')} className={current.startsWith('/guide/')?'active':undefined}>가이드</a></nav></div></header>
 <main className="wrap" onClick={onMainClick}>
 {!isKnown?<NotFound link={link}/>:
 page==='/about/'?<About link={link}/>:
 page==='/privacy/'?<Privacy/>:
 page==='/dsr/'?<DSR/>:
 page==='/ltv/'?<LTV/>:
 page==='/find-home/'?<FindHome/>:
 page==='/guide/'?<GuideList link={link}/>:
 page.startsWith('/guide/')?<GuideArticle slug={page.split('/')[2]} link={link}/>:
 <><section className="hero with-illust"><div><span className="eyebrow"><ShieldCheck size={15}/> ZIPMOYA LOAN CALCULATOR</span><h1>주택담보대출 계산기<br/><em>주담대 월 상환액, 한눈에.</em></h1><p>대출금액, 금리, 상환기간을 입력하면 주택담보대출 월 납입액부터 총 이자까지 바로 확인할 수 있어요.</p><button className="primary" onClick={()=>document.getElementById('calculator')?.scrollIntoView({behavior:'smooth'})}>지금 계산하기 <ChevronRight size={18}/></button></div><MortgageIllustration/></section>
 <section className="section" id="calculator"><div className="section-heading"><div><span className="eyebrow">MORTGAGE CALCULATOR</span><h2>주택담보대출(주담대) 계산기</h2><p>거치기간과 원리금균등·원금균등 상환방식까지 반영한 주담대 예상 납입액을 계산합니다.</p></div></div>
 <div className="calculator-grid"><div className="panel"><h3><Wallet size={20}/> 대출 조건 입력</h3><div className="fields"><label>대출금액 <small>만원</small><input type="number" min="1" value={amount} onChange={e=>setAmount(Number(e.target.value))} aria-describedby="amount-korean"/><span id="amount-korean" className="amount-korean" aria-live="polite">{koreanAmount(amount)}</span></label><label>연 이자율 <small>%</small><input type="number" min="0" max="100" step="0.1" value={rate} onChange={e=>setRate(Number(e.target.value))}/></label><label>대출기간 <small>년</small><select value={years} onChange={e=>{const y=Number(e.target.value);setYears(y);if(grace>=y)setGrace(0)}}>{[10,15,20,25,30,35,40,45,50].map(n=><option key={n} value={n}>{n}년</option>)}</select></label><label>거치기간 <small>년</small><select value={grace} onChange={e=>setGrace(Number(e.target.value))}>{Array.from({length:years},(_,i)=>i).map(n=><option key={n} value={n}>{n}년</option>)}</select></label></div><div className="method"><span>상환 방식</span><div className="seg"><button className={method==='equal-payment'?'active':''} onClick={()=>setMethod('equal-payment')}>원리금균등</button><button className={method==='equal-principal'?'active':''} onClick={()=>setMethod('equal-principal')}>원금균등</button></div></div><p className="hint">거치기간에는 이자만 납부하며, 거치 종료 후 남은 기간에 원금을 상환합니다.</p></div>
 <div className="panel result"><h3><TrendingDown size={20}/> 예상 상환 결과</h3>{rows.length?<><div className="main-result"><span>원금 상환 시작 월 납입액</span><strong>{money(firstRepayment)}<small>원</small></strong><span>{method==='equal-principal'?'원금균등 방식은 납입액이 점차 감소합니다.':'원리금균등 방식은 상환기간 동안 납입액이 대체로 일정합니다.'}</span></div><div className="stats"><div><span>총 이자</span><strong>{money(totalInterest)}원</strong></div><div><span>총 상환액</span><strong>{money(total)}원</strong></div><div><span>거치기간 월 이자</span><strong>{grace?money(rows[0].interest)+'원':'해당 없음'}</strong></div><div><span>대출 종료</span><strong>{years*12}개월</strong></div></div><div className="bar"><span style={{width:`${amount*10000/total*100}%`}}/></div><div className="legend"><span>● 원금 {money(amount*10000)}원</span><span>● 이자 {money(totalInterest)}원</span></div></>:<p role="alert">대출금액과 금리 등 입력값을 확인해 주세요.</p>}</div></div>
 {rows.length>0&&<div className="panel schedule"><div className="schedule-head"><div><h3><CalendarDays size={20}/> 월별 상환 일정</h3><p>원 단위 반올림 표시로 합계에 소폭 차이가 생길 수 있습니다.</p></div><button className="secondary" onClick={()=>setExpanded(!expanded)}>{expanded?'간단히 보기':'전체 상환표 보기'}</button></div><div className="table-scroll"><table><thead><tr><th>회차</th><th>월 납입액</th><th>원금</th><th>이자</th><th>남은 원금</th></tr></thead><tbody>{(expanded?rows:rows.slice(0,12)).map(r=><tr key={r.month}><td>{r.month}개월{r.grace?' (거치)':''}</td><td>{money(r.payment)}</td><td>{money(r.principal)}</td><td>{money(r.interest)}</td><td>{money(r.balance)}</td></tr>)}</tbody></table></div></div>}</section>
 <section className="content"><h2>주택담보대출 계산 방법</h2><p className="lead">주담대 계산기는 대출원금, 연 이자율, 대출기간을 바탕으로 매달 갚아야 할 원금과 이자를 계산합니다. 같은 금액을 빌려도 상환방식과 거치기간에 따라 월 상환액과 총 이자가 크게 달라지므로, 대출 상담 전에 여러 조건을 비교해 보세요.</p><div className="info-grid"><article><h3>원리금균등상환</h3><p>매월 원금과 이자를 합친 금액을 일정하게 납부하는 방식입니다. 초기에는 이자 비중이 높고 시간이 지날수록 원금 비중이 커집니다.</p></article><article><h3>원금균등상환</h3><p>매월 같은 금액의 원금을 갚고, 남은 원금에 대한 이자를 납부합니다. 초기 납입액은 크지만 시간이 갈수록 감소합니다.</p></article><article><h3>거치기간이란?</h3><p>일정 기간 원금 상환을 미루고 이자만 내는 조건입니다. 이 계산기는 전체 대출기간에 거치기간이 포함된다고 가정합니다.</p></article></div><MortgageExamples/><h2>자주 묻는 질문</h2>{FAQ.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}<UpdatedNote/></section></>}
 {['/','/dsr/','/ltv/'].includes(current)&&isKnown&&<RelatedTools current={current} link={link}/>}
 </main><footer><div className="wrap footer"><div><strong>ZIPMOYA</strong><p>집에 관한 계산과 정보, 집모야.</p><small>본 서비스는 참고용 계산 도구이며 금융 자문을 제공하지 않습니다.</small></div><div><a {...link('/about/')}>사이트 소개</a><a {...link('/privacy/')}>개인정보처리방침</a></div></div></footer></>;
}
