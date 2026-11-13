import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Newspaper, ChevronRight, Calculator, Percent, Home, MapPin, Search, X } from 'lucide-react';
import { BLOG_POSTS, POSTS_PER_PAGE, blogPageCount, blogListPath, blogPath } from './blog/posts';
import { renderMarkdown } from './blog/markdown';

type LinkProps = (path: string) => { href: string; onClick: (e: React.MouseEvent) => void };
const dateLabel = (d: string) => { const [y, m, day] = d.split('-'); return `${y}년 ${Number(m)}월 ${Number(day)}일`; };

function Pager({ page, total, link }: { page: number; total: number; link: LinkProps }) {
  if (total <= 1) return null;
  return <nav className="pager" aria-label="블로그 목록 페이지">
    {page > 1 ? <a {...link(blogListPath(page - 1))} rel="prev">‹ 이전</a> : <span className="off">‹ 이전</span>}
    {Array.from({ length: total }, (_, i) => i + 1).map(n => n === page ? <span key={n} className="cur" aria-current="page">{n}</span> : <a key={n} {...link(blogListPath(n))}>{n}</a>)}
    {page < total ? <a {...link(blogListPath(page + 1))} rel="next">다음 ›</a> : <span className="off">다음 ›</span>}
  </nav>;
}

/** 검색어 정규화: 공백 무시, 소문자 */
const norm = (t: string) => t.toLowerCase().replace(/\s+/g, '');
/** 본문 마크다운에서 기호를 걷어 낸 검색용 텍스트 */
const plain = (md: string) => md.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[#>*|`_-]/g, ' ');
const SEARCH_INDEX = BLOG_POSTS.map(p => ({ slug: p.slug, head: norm(`${p.title} ${p.tag} ${p.summary}`), body: norm(plain(p.body)) }));

/** 검색어의 모든 단어가 들어간 글을 제목·요약 일치 우선으로 정렬 */
function searchPosts(q: string, tag: string) {
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean).map(norm);
  if (!words.length && !tag) return [];
  return BLOG_POSTS.map((p, i) => {
    const ix = SEARCH_INDEX[i];
    if (tag && p.tag !== tag) return null;
    if (!words.every(w => ix.head.includes(w) || ix.body.includes(w))) return null;
    const score = words.reduce((n, w) => n + (ix.head.includes(w) ? 10 : 0) + (ix.body.split(w).length - 1), 0);
    return { p, score };
  }).filter((x): x is { p: typeof BLOG_POSTS[number]; score: number } => !!x)
    .sort((a, b) => b.score - a.score || b.p.date.localeCompare(a.p.date)).map(x => x.p);
}

const TAGS = Array.from(new Set(BLOG_POSTS.map(p => p.tag)));

function PostItems({ items, link }: { items: typeof BLOG_POSTS; link: LinkProps }) {
  return <ul className="blog-items">{items.map(p => <li key={p.slug}>
    <a {...link(blogPath(p.slug))} className={p.image ? 'has-thumb' : undefined}>
      {p.image && <img className="blog-thumb" src={p.image} alt="" width={120} height={86} loading="lazy"/>}
      <span className="blog-text"><span className="blog-meta"><span className="guide-tag">{p.tag}</span><time dateTime={p.date}>{dateLabel(p.date)}</time></span>
      <strong>{p.title}</strong>
      {p.summary && <p>{p.summary}</p>}</span>
    </a>
  </li>)}</ul>;
}

export function BlogList({ page = 1, link }: { page?: number; link: LinkProps }) {
  const total = blogPageCount();
  const cur = Math.min(Math.max(1, page), total);
  const items = BLOG_POSTS.slice((cur - 1) * POSTS_PER_PAGE, cur * POSTS_PER_PAGE);
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('');
  // 주소의 ?q=·?tag= 반영 (공유·뒤로가기용)
  useEffect(() => { try { const sp = new URLSearchParams(window.location.search); const v = sp.get('q'); const t = sp.get('tag'); if (v) setQ(v); if (t && TAGS.includes(t)) setTag(t); } catch { /* noop */ } }, []);
  const sync = (nq: string, nt: string) => {
    try { const u = new URL(window.location.href); if (nq.trim()) u.searchParams.set('q', nq); else u.searchParams.delete('q'); if (nt) u.searchParams.set('tag', nt); else u.searchParams.delete('tag'); window.history.replaceState(window.history.state, '', u.pathname + u.search); } catch { /* noop */ }
  };
  const update = (v: string) => { setQ(v); sync(v, tag); };
  const pickTag = (t: string) => { const nt = tag === t ? '' : t; setTag(nt); sync(q, nt); };
  const results = useMemo(() => searchPosts(q, tag), [q, tag]);
  const searching = q.trim().length > 0 || !!tag;
  const label = [tag && `#${tag}`, q.trim() && `‘${q.trim()}’`].filter(Boolean).join(' ');
  return <section className="article guide-list blog-list">
    <span className="eyebrow"><Newspaper size={15}/> ZIPMOYA BLOG</span>
    <h1>오늘의 부동산 뉴스, 내 대출엔 무슨 영향?</h1>
    <p>매일, 최근 나온 부동산·대출 뉴스 중 중요한 소식을 골라 쉽게 정리하고, 내 대출과 자금 계획에 어떤 영향이 있는지 계산 예시와 함께 알려드립니다.</p>
    {BLOG_POSTS.length > 0 && <form className="blog-search" role="search" onSubmit={e => e.preventDefault()}>
      <Search size={18} aria-hidden="true"/>
      <input type="search" value={q} onChange={e => update(e.target.value)} placeholder="블로그 글 검색 (예: DSR, 전세, 보금자리론)" aria-label="블로그 글 검색" enterKeyHint="search"/>
      {searching && <button type="button" onClick={() => update('')} aria-label="검색어 지우기"><X size={16}/></button>}
    </form>}
    {BLOG_POSTS.length > 0 && <div className="blog-tags" aria-label="주제별 보기">{TAGS.map(t => <button key={t} type="button" className={tag === t ? 'on' : undefined} aria-pressed={tag === t} onClick={() => pickTag(t)}>{t}</button>)}</div>}
    {searching ? <>
      <p className="blog-search-count" aria-live="polite"><strong>{label}</strong> 검색 결과 {results.length}건 <button type="button" className="blog-search-reset" onClick={() => { setQ(''); setTag(''); sync('', ''); }}>전체 글 보기</button></p>
      {results.length ? <PostItems items={results} link={link}/> :
        <div className="empty-result"><Search size={28}/><strong>검색 결과가 없습니다</strong><p>다른 단어로 검색하거나, 위의 주제를 눌러 보세요.</p></div>}
    </> : <>
      {items.length === 0 ? <div className="empty-result"><Newspaper size={28}/><strong>첫 글을 준비하고 있습니다</strong><p>매일 새 글이 올라옵니다.</p></div> : <PostItems items={items} link={link}/>}
      <Pager page={cur} total={total} link={link}/>
    </>}
  </section>;
}

const TOOLS = [
  { path: '/find-home/', name: '내 집 찾기', icon: MapPin }, { path: '/', name: '주담대 계산기', icon: Calculator },
  { path: '/dsr/', name: 'DSR 계산기', icon: Percent }, { path: '/ltv/', name: 'LTV 계산기', icon: Home },
];

export function BlogPostView({ slug, link }: { slug: string; link: LinkProps }) {
  const idx = BLOG_POSTS.findIndex(p => p.slug === slug);
  const post = BLOG_POSTS[idx];
  if (!post) return null;
  const newer = BLOG_POSTS[idx - 1], older = BLOG_POSTS[idx + 1];
  return <article className="article guide blog-post">
    <nav className="breadcrumb" aria-label="현재 위치"><a {...link('/blog/')}>블로그</a> <ChevronRight size={13}/> <span>{post.tag}</span></nav>
    <h1>{post.title}</h1>
    <p className="guide-meta">ZIPMOYA · <time dateTime={post.date}>{dateLabel(post.date)}</time></p>
    {post.summary && <p className="guide-summary">{post.summary}</p>}
    {post.image && <img className="blog-hero" src={post.image} alt="" width={240} height={171}/>}
    <div className="guide-body">{renderMarkdown(post.body)}</div>
    {post.sources.length > 0 && <div className="blog-sources"><strong>참고한 기사·자료</strong><ul>{post.sources.map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer nofollow">{s.title}</a></li>)}</ul></div>}
    <p className="hint">이 글은 공개된 뉴스와 자료를 바탕으로 ZIPMOYA가 정리한 것으로, 투자·대출 권유가 아닙니다. 정책과 금리는 바뀔 수 있으니 실제 적용 기준은 금융기관과 정부 발표를 확인하세요.</p>
    <h2 className="guide-sub">내 조건으로 계산해 보기</h2>
    <div className="guide-tools">{TOOLS.map(t => { const I = t.icon; return <a key={t.path} className="primary" {...link(t.path)}><I size={17}/> {t.name} <ChevronRight size={16}/></a>; })}</div>
    <nav className="blog-nav" aria-label="이전·다음 글">
      {older ? <a {...link(blogPath(older.slug))}><span>이전 글</span>{older.title}</a> : <span/>}
      {newer ? <a {...link(blogPath(newer.slug))} className="next"><span>다음 글</span>{newer.title}</a> : <span/>}
    </nav>
  </article>;
}
