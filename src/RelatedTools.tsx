import type React from 'react';
import { Calculator, Percent, Home, ChevronRight } from 'lucide-react';
import { NotFoundIllustration } from './Illustrations';

type LinkProps = (path: string) => { href: string; onClick: (e: React.MouseEvent) => void };

const TOOLS = [
  { path: '/', icon: Calculator, name: '주담대 계산기', desc: '빌릴 금액이 정해졌다면 월 상환액과 총 이자를 상환방식별로 비교해 보세요.' },
  { path: '/dsr/', icon: Percent, name: 'DSR 계산기', desc: '내 연소득으로 받을 수 있는 대출한도를 스트레스 DSR까지 반영해 확인하세요.' },
  { path: '/ltv/', icon: Home, name: 'LTV 계산기', desc: '집값 기준으로 빌릴 수 있는 최대 금액과 부족한 자금을 확인하세요.' },
];

/** 계산기 페이지 하단의 '다른 계산기' 안내. 페이지끼리 서로 링크해 이용자 이동과 검색엔진 수집을 돕습니다. */
export function RelatedTools({ current, link }: { current: string; link: LinkProps }) {
  return <section className="related">
    <h2>함께 쓰면 좋은 계산기</h2>
    <p className="lead">실제 주택담보대출 한도는 LTV(집값 기준)와 DSR(소득 기준) 한도 중 더 적은 금액으로 정해집니다. 두 한도를 확인한 뒤 주담대 계산기로 상환 계획을 세워 보세요.</p>
    <div className="about-tools">
      {TOOLS.filter(t => t.path !== current).map(({ path, icon: Icon, name, desc }) =>
        <a key={path} className="about-card" {...link(path)}>
          <span className="about-icon"><Icon size={20}/></span>
          <strong>{name}</strong>
          <p>{desc}</p>
          <span className="about-more">바로 계산하기 <ChevronRight size={15}/></span>
        </a>)}
    </div>
  </section>;
}

/** 없는 주소로 들어왔을 때 보여주는 화면(404). */
export function NotFound({ link }: { link: LinkProps }) {
  return <section className="article notfound">
    <div className="hero with-illust notfound-hero">
      <div>
        <span className="eyebrow">404 NOT FOUND</span>
        <h1>페이지를 찾을 수 없습니다</h1>
        <p>주소가 바뀌었거나 삭제된 페이지입니다. 아래 계산기에서 원하는 기능을 찾아보세요.</p>
        <a className="primary" {...link('/')}>홈으로 가기 <ChevronRight size={18}/></a>
      </div>
      <NotFoundIllustration/>
    </div>
    <div className="about-tools">
      {TOOLS.map(({ path, icon: Icon, name, desc }) =>
        <a key={path} className="about-card" {...link(path)}>
          <span className="about-icon"><Icon size={20}/></span>
          <strong>{name}</strong>
          <p>{desc}</p>
        </a>)}
    </div>
  </section>;
}
