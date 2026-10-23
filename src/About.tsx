import type React from 'react';
import { Calculator, Percent, Home, ShieldCheck, Sigma, Smartphone, BookOpen, Mail, ChevronRight } from 'lucide-react';

type LinkProps = (path: string) => { href: string; onClick: (e: React.MouseEvent) => void };

/** 소개 페이지 대표 이미지: 집과 계산기, 상승 그래프를 단순한 도형으로 그린 일러스트(외부 파일 없음). */
function AboutIllustration() {
  return <svg className="about-illust" viewBox="0 0 420 300" role="img" aria-labelledby="about-illust-title">
    <title id="about-illust-title">집과 계산기, 그래프로 표현한 ZIPMOYA 일러스트</title>
    <rect x="0" y="0" width="420" height="300" rx="24" fill="#eef5fc"/>
    <circle cx="340" cy="62" r="30" fill="#d4e5f4"/>
    <rect x="30" y="246" width="360" height="10" rx="5" fill="#d4e5f4"/>
    {/* 집 */}
    <path d="M70 150 L160 82 L250 150 Z" fill="#0d4177"/>
    <rect x="86" y="146" width="148" height="104" rx="6" fill="#ffffff" stroke="#c9d9ea" strokeWidth="2"/>
    <rect x="104" y="168" width="38" height="34" rx="4" fill="#d4e5f4"/>
    <path d="M123 168 V202 M104 185 H142" stroke="#ffffff" strokeWidth="3"/>
    <rect x="168" y="186" width="44" height="64" rx="4" fill="#216baa"/>
    <circle cx="203" cy="220" r="3" fill="#ffffff"/>
    <rect x="200" y="96" width="18" height="34" rx="2" fill="#0b2545"/>
    {/* 그래프 카드 */}
    <rect x="262" y="104" width="128" height="86" rx="12" fill="#ffffff" stroke="#c9d9ea" strokeWidth="2"/>
    <rect x="280" y="160" width="14" height="18" rx="3" fill="#bcd6ee"/>
    <rect x="302" y="146" width="14" height="32" rx="3" fill="#8bb9e2"/>
    <rect x="324" y="134" width="14" height="44" rx="3" fill="#4f93cf"/>
    <rect x="346" y="120" width="14" height="58" rx="3" fill="#216baa"/>
    {/* 계산기 */}
    <g transform="rotate(-8 312 228)">
      <rect x="270" y="186" width="86" height="96" rx="12" fill="#0b2545"/>
      <rect x="282" y="198" width="62" height="20" rx="4" fill="#e8f3ff"/>
      <text x="338" y="213" textAnchor="end" fontSize="12" fontWeight="700" fill="#0b2545" fontFamily="system-ui, sans-serif">%</text>
      {[0, 1, 2].map(r => [0, 1, 2].map(c =>
        <rect key={`${r}-${c}`} x={284 + c * 21} y={226 + r * 16} width="15" height="10" rx="3" fill={r === 2 && c === 2 ? '#4f93cf' : '#3a5878'}/>))}
    </g>
  </svg>;
}

const TOOLS = [
  { path: '/', icon: Calculator, name: '주담대 계산기', desc: '대출금액·금리·기간·거치기간을 넣으면 원리금균등·원금균등 방식의 월 상환액, 총 이자, 월별 상환표를 계산합니다.' },
  { path: '/dsr/', icon: Percent, name: 'DSR 계산기', desc: '연소득과 기존 대출 상환액으로 DSR 비율과 신규 대출 가능액을 계산합니다. 스트레스 DSR 1~3단계와 지역·금리유형별 반영비율도 비교할 수 있습니다.' },
  { path: '/ltv/', icon: Home, name: 'LTV 계산기', desc: '주택가격과 LTV 비율로 담보가치 기준 대출한도를 구하고, 기존 대출과 보유 현금을 반영해 부족 자금까지 보여줍니다.' },
];

const PRINCIPLES = [
  { icon: ShieldCheck, title: '입력값은 저장하지 않습니다', desc: '모든 계산은 이용자의 브라우저 안에서 이루어지며, 입력한 금액과 소득은 서버로 전송되지 않습니다.' },
  { icon: Sigma, title: '계산식을 공개합니다', desc: '결과만 보여주지 않고 어떤 공식과 숫자로 계산했는지 함께 보여줘 직접 검증할 수 있게 합니다.' },
  { icon: Smartphone, title: '가입 없이 무료로', desc: '회원가입이나 앱 설치 없이 PC와 모바일 어디서나 바로 사용할 수 있습니다.' },
];

export function About({ link }: { link: LinkProps }) {
  return <section className="article about">
    <div className="about-hero">
      <div>
        <span className="eyebrow">ABOUT ZIPMOYA</span>
        <h1>ZIPMOYA(집모야) 소개</h1>
        <p>ZIPMOYA(집모야)는 "집, 뭐야?"라는 질문에서 출발했습니다. 집을 사거나 대출을 알아볼 때 마주치는 숫자들, 월 상환액과 DSR, LTV를 누구나 쉽게 계산하고 이해할 수 있도록 계산 도구와 부동산 정보를 한곳에 모아 제공합니다.</p>
      </div>
      <AboutIllustration/>
    </div>

    <h2>제공하는 계산기</h2>
    <div className="about-tools">
      {TOOLS.map(({ path, icon: Icon, name, desc }) =>
        <a key={path} className="about-card" {...link(path)}>
          <span className="about-icon"><Icon size={20}/></span>
          <strong>{name}</strong>
          <p>{desc}</p>
          <span className="about-more">바로 계산하기 <ChevronRight size={15}/></span>
        </a>)}
    </div>

    <h2>세 계산기는 이렇게 함께 쓰면 좋습니다</h2>
    <ol className="about-steps">
      <li><strong>LTV 계산기</strong>로 집값 기준으로 빌릴 수 있는 최대 금액을 확인합니다.</li>
      <li><strong>DSR 계산기</strong>로 내 소득으로 감당할 수 있는 대출 한도를 확인합니다. 실제 한도는 LTV와 DSR 중 더 적은 금액이 기준이 됩니다.</li>
      <li><strong>주담대 계산기</strong>로 그 금액을 빌렸을 때 매달 갚을 돈과 총 이자를 상환방식별로 비교합니다.</li>
    </ol>

    <h2>ZIPMOYA의 원칙</h2>
    <div className="about-principles">
      {PRINCIPLES.map(({ icon: Icon, title, desc }) =>
        <div key={title}><Icon size={20}/><strong>{title}</strong><p>{desc}</p></div>)}
    </div>

    <h2><BookOpen size={18}/> 앞으로 준비 중인 내용</h2>
    <p>계산기와 함께 부동산 대출 규제, 청약, 세금 등 집과 관련된 정보를 알기 쉬운 글로 꾸준히 소개할 예정입니다.</p>

    <h2>이용 시 유의사항</h2>
    <p>계산 결과는 입력 조건에 따른 수학적 추정치입니다. 실제 대출 가능 금액과 상환액은 금융기관의 심사, 금리 변동, 수수료, 세금, 지역·상품별 규제에 따라 달라질 수 있으므로 대출 전에는 반드시 금융기관과 상담하세요. ZIPMOYA는 금융 자문을 제공하지 않습니다.</p>

    <h2><Mail size={18}/> 문의</h2>
    <p>오류 제보, 기능 제안, 제휴 문의는 이메일로 보내 주세요: <a href="mailto:dbfl0627@gmail.com">dbfl0627@gmail.com</a></p>
  </section>;
}
