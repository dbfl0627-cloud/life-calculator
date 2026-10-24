import type React from 'react';
import { BookOpen, ChevronRight, Calculator, Percent, Home, MapPin } from 'lucide-react';
import { GUIDE_META, guidePath } from './guides/meta';
import { GUIDE_CONTENT } from './guides/content';

type LinkProps = (path: string) => { href: string; onClick: (e: React.MouseEvent) => void };
const TOOL_INFO: Record<string, { name: string; icon: typeof Calculator }> = {
  '/': { name: '주담대 계산기', icon: Calculator },
  '/dsr/': { name: 'DSR 계산기', icon: Percent },
  '/ltv/': { name: 'LTV 계산기', icon: Home },
  '/find-home/': { name: '내 집 찾기', icon: MapPin },
};
const dateLabel = (d: string) => { const [y, m, day] = d.split('-'); return `${y}년 ${Number(m)}월 ${Number(day)}일`; };

export function GuideList({ link }: { link: LinkProps }) {
  return <section className="article guide-list">
    <span className="eyebrow"><BookOpen size={15}/> ZIPMOYA GUIDE</span>
    <h1>집 사기 전에 알아야 할 대출·자금 가이드</h1>
    <p>대출한도, 상환방식, 세금처럼 내 집 마련에 꼭 필요한 내용을 계산 예시와 함께 정리했습니다. 각 글의 숫자는 ZIPMOYA 계산기와 같은 공식으로 계산했습니다.</p>
    <div className="guide-cards">
      {GUIDE_META.map(g => <a key={g.slug} className="guide-card" {...link(guidePath(g.slug))}>
        <span className="guide-tag">{g.tag}</span>
        <strong>{g.title}</strong>
        <p>{g.description}</p>
        <span className="about-more">읽어보기 <ChevronRight size={15}/></span>
      </a>)}
    </div>
  </section>;
}

export function GuideArticle({ slug, link }: { slug: string; link: LinkProps }) {
  const meta = GUIDE_META.find(g => g.slug === slug);
  const Body = GUIDE_CONTENT[slug];
  if (!meta || !Body) return null;
  const others = GUIDE_META.filter(g => g.slug !== slug).slice(0, 4);
  return <article className="article guide">
    <nav className="breadcrumb" aria-label="현재 위치"><a {...link('/guide/')}>가이드</a> <ChevronRight size={13}/> <span>{meta.tag}</span></nav>
    <h1>{meta.title}</h1>
    <p className="guide-meta">ZIPMOYA · <time dateTime={meta.updated ?? meta.date}>{dateLabel(meta.updated ?? meta.date)}</time> 기준</p>
    <p className="guide-summary">{meta.description}</p>
    <div className="guide-body">{Body()}</div>
    <p className="hint">이 글의 계산은 참고용 예시이며, 실제 대출 가능 금액과 세금은 금융기관 심사와 개인 상황에 따라 달라질 수 있습니다.</p>
    <h2 className="guide-sub">이 글과 함께 쓰는 계산기</h2>
    <div className="guide-tools">
      {meta.tools.map(t => { const info = TOOL_INFO[t]; if (!info) return null; const Icon = info.icon;
        return <a key={t} className="primary" {...link(t)}><Icon size={17}/> {info.name} <ChevronRight size={16}/></a>; })}
    </div>
    <h2 className="guide-sub">다른 가이드</h2>
    <ul className="guide-others">{others.map(g => <li key={g.slug}><a {...link(guidePath(g.slug))}>{g.title}</a></li>)}</ul>
  </article>;
}
