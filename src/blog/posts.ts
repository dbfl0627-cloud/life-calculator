/**
 * 블로그 글 목록. src/blog/posts/*.md 파일을 빌드할 때 모두 읽어 옵니다(DB 없음).
 * 파일 이름: YYYY-MM-DD-영문-슬러그.md  → 주소: /blog/영문-슬러그/
 * 파일 맨 위 머리말(frontmatter):
 *   ---
 *   title: 제목
 *   date: 2026-11-07
 *   tag: 금리
 *   image: /blog-images/영문-슬러그.svg  (선택. public/blog-images/에 둔 썸네일, 420x300 SVG)
 *   summary: 한두 문장 요약 (목록·검색 설명에 사용)
 *   sources:
 *     - 출처 기사 제목 | https://…
 *   ---
 */
export type BlogPost = { slug: string; file: string; title: string; date: string; tag: string; summary: string; image?: string; sources: { title: string; url: string }[]; body: string };

const files = import.meta.glob('./posts/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

function parse(file: string, raw: string): BlogPost | null {
  const m = raw.replace(/\r/g, '').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return null;
  const meta: Record<string, string> = {}; const sources: BlogPost['sources'] = [];
  let inSources = false;
  for (const line of m[1].split('\n')) {
    if (/^sources:\s*$/.test(line)) { inSources = true; continue; }
    const item = line.match(/^\s+-\s+(.+?)\s*\|\s*(https?:\/\/\S+)\s*$/);
    if (inSources && item) { sources.push({ title: item[1], url: item[2] }); continue; }
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) { inSources = false; meta[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, ''); }
  }
  const name = file.split('/').pop()!.replace(/\.md$/, '');
  const slug = name.replace(/^\d{4}-\d{2}-\d{2}-/, '');
  if (!meta.title || !meta.date) return null;
  return { slug, file: name, title: meta.title, date: meta.date, tag: meta.tag || '부동산', summary: meta.summary || '', image: meta.image || undefined, sources, body: m[2].trim() };
}

/** 최신 글 먼저 (같은 날짜면 파일 이름 순) */
export const BLOG_POSTS: BlogPost[] = Object.entries(files)
  .map(([f, raw]) => parse(f, raw)).filter((p): p is BlogPost => !!p)
  .sort((a, b) => b.date.localeCompare(a.date) || a.file.localeCompare(b.file));

export const POSTS_PER_PAGE = 10;
export const blogPageCount = () => Math.max(1, Math.ceil(BLOG_POSTS.length / POSTS_PER_PAGE));
export const blogListPath = (page: number) => page <= 1 ? '/blog/' : `/blog/page/${page}/`;
export const blogPath = (slug: string) => `/blog/${slug}/`;
