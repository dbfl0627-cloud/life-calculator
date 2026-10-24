import type React from 'react';
import { BookOpen, ChevronRight, Calculator, Percent, Home, MapPin } from 'lucide-react';
import { GUIDE_META, GUIDES_SORTED, GUIDES_PER_PAGE, guidePath, guidePageCount, guideListPath } from './guides/meta';
import { GUIDE_CONTENT } from './guides/content';
import type { GuideImage } from './guides/meta';
import { StepsIllustration, SalaryIllustration, StressIllustration, CompareRatioIllustration, RepaymentIllustration, TermIllustration, RateIllustration, GraceIllustration, CostIllustration, PriceTagIllustration } from './Illustrations';

const IMAGES: Record<GuideImage, (p: { uid?: string }) => React.ReactElement> = {
  steps: StepsIllustration, salary: SalaryIllustration, stress: StressIllustration, ratio: CompareRatioIllustration, repay: RepaymentIllustration,
  term: TermIllustration, rate: RateIllustration, grace: GraceIllustration, cost: CostIllustration, tag: PriceTagIllustration,
};
/** 글 썸네일·대표 이미지 (같은 페이지에 여러 번 나와도 id가 겹치지 않도록 uid 사용) */
function GuideImg({ image, uid }: { image: GuideImage; uid: string }) { const C = IMAGES[image]; return <C uid={uid}/>; }

type LinkProps = (path: string) => { href: string; onClick: (e: React.MouseEvent) => void };
const TOOL_INFO: Record<string, { name: string; icon: typeof Calculator }> = {
  '/': { name: '주담대 계산기', icon: Calculator },
  '/dsr/': { name: 'DSR 계산기', icon: Percent },
  '/ltv/': { name: 'LTV 계산기', icon: Home },
  '/find-home/': { name: '내 집 찾기', icon: MapPin },
};
const dateLabel = (d: string) => { const [y, m, day] = d.split('-'); return `${y}년 ${Number(m)}월 ${Number(day)}일`; };

function Pager({ page, total, link }: { page: number; total: number; link: LinkProps }) {
  if (total <= 1) return null;
  return <nav className="pager" aria-label="가이드 목록 페이지">
    {page > 1 ? <a {...link(guideListPath(page - 1))} rel="prev">‹ 이전</a> : <span className="off">‹ 이전</span>}
    {Array.from({ length: total }, (_, i) => i + 1).map(n => n === page
      ? <span key={n} className="cur" aria-current="page">{n}</span>
      : <a key={n} {...link(guideListPath(n))}>{n}</a>)}
    {page < total ? <a {...link(guideListPath(page + 1))} rel="next">다음 ›</a> : <span className="off">다음 ›</span>}
  </nav>;
}

export function GuideList({ page = 1, link }: { page?: number; link: LinkProps }) {
  const total = guidePageCount();
  const cur = Math.min(Math.max(1, page), total);
  const items = GUIDES_SORTED.slice((cur - 1) * GUIDES_PER_PAGE, cur * GUIDES_PER_PAGE);
  return <section className="article guide-list">
    <span className="eyebrow"><BookOpen size={15}/> ZIPMOYA GUIDE</span>
    <h1>집 사기 전에 알아야 할 대출·자금 가이드</h1>
    <p>대출한도, 상환방식, 세금처럼 내 집 마련에 꼭 필요한 내용을 계산 예시와 함께 정리했습니다. 각 글의 숫자는 ZIPMOYA 계산기와 같은 공식으로 계산했습니다.</p>
    <div className="guide-cards">
      {items.map(g => <a key={g.slug} className="guide-card" {...link(guidePath(g.slug))}>
        <div className="guide-thumb" aria-hidden="true"><GuideImg image={g.image} uid={`-card-${g.slug}`}/></div>
        <span className="guide-tag">{g.tag}</span>
        <strong>{g.title}</strong>
        <p>{g.description}</p>
        <span className="about-more">읽어보기 <ChevronRight size={15}/></span>
      </a>)}
    </div>
    <Pager page={cur} total={total} link={link}/>
  </section>;
}

export function GuideArticle({ slug, link }: { slug: string; link: LinkProps }) {
  const meta = GUIDE_META.find(g => g.slug === slug);
  const Body = GUIDE_CONTENT[slug];
  if (!meta || !Body) return null;
  const others = GUIDES_SORTED.filter(g => g.slug !== slug).slice(0, 4);
  return <article className="article guide">
    <nav className="breadcrumb" aria-label="현재 위치"><a {...link('/guide/')}>가이드</a> <ChevronRight size={13}/> <span>{meta.tag}</span></nav>
    <h1>{meta.title}</h1>
    <p className="guide-meta">ZIPMOYA · <time dateTime={meta.updated ?? meta.date}>{dateLabel(meta.updated ?? meta.date)}</time> 기준</p>
    <div className="guide-hero"><GuideImg image={meta.image} uid={`-hero-${slug}`}/></div>
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
