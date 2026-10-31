import type { ReactNode } from 'react';

/**
 * 블로그용 아주 작은 마크다운 렌더러 (외부 라이브러리·HTML 삽입 없이 React 요소로 변환하므로 안전).
 * 지원: ## / ### 제목, 문단, - 목록, 1. 목록, > 인용, | 표 |, **굵게**, [링크](https://…), 빈 줄로 문단 구분.
 */
function inline(text: string, key = 0): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)\s]+)\)/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) out.push(<strong key={`${key}-b${i++}`}>{m[1]}</strong>);
    else {
      const href = m[3], external = href.startsWith('http');
      out.push(<a key={`${key}-a${i++}`} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer nofollow' } : {})}>{m[2]}</a>);
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function renderMarkdown(src: string): ReactNode[] {
  const lines = src.replace(/\r/g, '').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0, k = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.startsWith('### ')) { blocks.push(<h3 key={k++}>{inline(line.slice(4), k)}</h3>); i++; continue; }
    if (line.startsWith('## ')) { blocks.push(<h2 key={k++}>{inline(line.slice(3), k)}</h2>); i++; continue; }
    if (line.startsWith('> ')) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) buf.push(lines[i++].slice(2));
      blocks.push(<blockquote key={k++}>{inline(buf.join(' '), k)}</blockquote>); continue;
    }
    if (/^\s*[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*] /.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*] /, ''));
      blocks.push(<ul key={k++}>{items.map((t, j) => <li key={j}>{inline(t, j)}</li>)}</ul>); continue;
    }
    if (/^\s*\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\. /.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+\. /, ''));
      blocks.push(<ol key={k++}>{items.map((t, j) => <li key={j}>{inline(t, j)}</li>)}</ol>); continue;
    }
    if (line.trim().startsWith('|')) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const cells = lines[i++].trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
        if (!cells.every(c => /^:?-{2,}:?$/.test(c))) rows.push(cells);
      }
      const [head, ...body] = rows;
      blocks.push(<div key={k++} className="table-scroll example-table"><table>
        <thead><tr>{head.map((c, j) => <th key={j}>{inline(c, j)}</th>)}</tr></thead>
        <tbody>{body.map((r, ri) => <tr key={ri}>{r.map((c, j) => <td key={j}>{inline(c, j)}</td>)}</tr>)}</tbody>
      </table></div>); continue;
    }
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{2,3} |> |\s*[-*] |\s*\d+\. |\s*\|)/.test(lines[i])) buf.push(lines[i++].trim());
    blocks.push(<p key={k++}>{inline(buf.join(' '), k)}</p>);
  }
  return blocks;
}
