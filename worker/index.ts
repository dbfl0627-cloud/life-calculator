/**
 * ZIPMOYA API Worker
 * - /api/* 요청만 이 Worker가 처리하고, 나머지는 정적 사이트(dist)가 응답합니다(wrangler.jsonc run_worker_first).
 * - 공공데이터포털 인증키는 코드에 넣지 않고 Cloudflare 비밀값 DATA_GO_KR_KEY 로 받습니다.
 *
 * GET /api/apt?lawd=11680&months=6
 *   해당 시군구(법정동코드 앞 5자리)의 최근 N개월 아파트 매매 실거래가를 단지·전용면적별로 묶어 돌려줍니다.
 */

interface Env {
  DATA_GO_KR_KEY?: string;
  ASSETS: { fetch: (req: Request) => Promise<Response> };
}

const ENDPOINT = 'https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev';
const CACHE_SECONDS = 60 * 60 * 12; // 12시간

export type Trade = { aptNm: string; umdNm: string; jibun: string; area: number; price: number; date: string; floor: number; buildYear: number };
export type AptType = { area: number; count: number; latestPrice: number; latestDate: string; minPrice: number; maxPrice: number };
export type Apt = { name: string; dong: string; jibun: string; buildYear: number; types: AptType[] };

const tag = (xml: string, name: string) => {
  const m = xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return m ? m[1].trim() : '';
};

/** 실거래가 XML 응답 → 거래 목록. 해제된 거래(cdealType=O)는 제외합니다. */
export function parseTrades(xml: string): { trades: Trade[]; total: number; code: string; message: string } {
  const code = tag(xml, 'resultCode');
  const message = tag(xml, 'resultMsg');
  const total = Number(tag(xml, 'totalCount')) || 0;
  const trades: Trade[] = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const it = m[1];
    if (tag(it, 'cdealType') === 'O') continue;
    const price = Number(tag(it, 'dealAmount').replace(/,/g, ''));
    const area = Number(tag(it, 'excluUseAr'));
    if (!price || !area) continue;
    const y = tag(it, 'dealYear'), mo = tag(it, 'dealMonth').padStart(2, '0'), d = tag(it, 'dealDay').padStart(2, '0');
    trades.push({ aptNm: tag(it, 'aptNm'), umdNm: tag(it, 'umdNm'), jibun: tag(it, 'jibun'), area, price, date: `${y}-${mo}-${d}`, floor: Number(tag(it, 'floor')) || 0, buildYear: Number(tag(it, 'buildYear')) || 0 });
  }
  return { trades, total, code, message };
}

/** 거래 목록 → 단지·전용면적(소수 첫째 자리 반올림)별 요약 */
export function groupTrades(trades: Trade[]): Apt[] {
  const apts = new Map<string, Apt & { _types: Map<number, AptType> }>();
  for (const t of trades) {
    const key = `${t.umdNm}|${t.jibun}|${t.aptNm}`;
    let a = apts.get(key);
    if (!a) { a = { name: t.aptNm, dong: t.umdNm, jibun: t.jibun, buildYear: t.buildYear, types: [], _types: new Map() }; apts.set(key, a); }
    const area = Math.round(t.area * 10) / 10;
    const ty = a._types.get(area);
    if (!ty) a._types.set(area, { area, count: 1, latestPrice: t.price, latestDate: t.date, minPrice: t.price, maxPrice: t.price });
    else {
      ty.count++;
      ty.minPrice = Math.min(ty.minPrice, t.price);
      ty.maxPrice = Math.max(ty.maxPrice, t.price);
      if (t.date > ty.latestDate) { ty.latestDate = t.date; ty.latestPrice = t.price; }
    }
  }
  return [...apts.values()]
    .map(({ _types, ...a }) => ({ ...a, types: [..._types.values()].sort((x, y) => x.area - y.area) }))
    .sort((x, y) => x.name.localeCompare(y.name, 'ko'));
}

/** 오늘(한국시간) 기준 최근 n개월의 YYYYMM 목록 */
export function recentMonths(n: number, now = new Date()): string[] {
  const kst = new Date(now.getTime() + 9 * 3600 * 1000);
  let y = kst.getUTCFullYear(), m = kst.getUTCMonth() + 1;
  const out: string[] = [];
  for (let i = 0; i < n; i++) { out.push(`${y}${String(m).padStart(2, '0')}`); if (--m === 0) { m = 12; y--; } }
  return out;
}

async function fetchMonth(key: string, lawd: string, ym: string): Promise<Trade[]> {
  const all: Trade[] = [];
  for (let page = 1; page <= 10; page++) {
    const url = `${ENDPOINT}?serviceKey=${encodeURIComponent(key)}&LAWD_CD=${lawd}&DEAL_YMD=${ym}&pageNo=${page}&numOfRows=1000`;
    const res = await fetch(url);
    const xml = await res.text();
    const r = parseTrades(xml);
    if (r.code && r.code !== '000' && r.code !== '00') throw new Error(`실거래가 API 오류(${r.code}): ${r.message}`);
    if (!res.ok && !r.code) throw new Error(`실거래가 API 응답 오류: HTTP ${res.status}`);
    all.push(...r.trades);
    if (page * 1000 >= r.total) break;
  }
  return all;
}

const json = (data: unknown, status = 200, cache = 0) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cache ? `public, max-age=${cache}` : 'no-store' },
});

export async function handleApt(url: URL, env: Env): Promise<Response> {
  const lawd = url.searchParams.get('lawd') ?? '';
  const months = Math.min(12, Math.max(1, Number(url.searchParams.get('months')) || 6));
  if (!/^\d{5}$/.test(lawd)) return json({ error: '시군구 코드(lawd)는 숫자 5자리여야 합니다.' }, 400);
  if (!env.DATA_GO_KR_KEY) return json({ error: '서버에 실거래가 인증키(DATA_GO_KR_KEY)가 설정되지 않았습니다.' }, 500);
  const ymList = recentMonths(months);
  try {
    const results = await Promise.all(ymList.map(ym => fetchMonth(env.DATA_GO_KR_KEY!, lawd, ym)));
    const trades = results.flat();
    return json({ lawd, months: ymList, tradeCount: trades.length, apts: groupTrades(trades), source: '국토교통부 아파트 매매 실거래가' }, 200, CACHE_SECONDS);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : '실거래가 조회에 실패했습니다.' }, 502);
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: { waitUntil: (p: Promise<unknown>) => void }): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/apt') {
      // 같은 시군구·기간 요청은 Cloudflare 캐시에서 바로 응답 (API 호출 수 절약)
      const cache = (globalThis as any).caches?.default as Cache | undefined;
      const cacheKey = new Request(`${url.origin}/api/apt?lawd=${url.searchParams.get('lawd')}&months=${url.searchParams.get('months') ?? 6}&d=${recentMonths(1)[0]}`);
      const hit = cache && await cache.match(cacheKey);
      if (hit) return hit;
      const res = await handleApt(url, env);
      if (cache && res.status === 200) ctx.waitUntil(cache.put(cacheKey, res.clone()));
      return res;
    }
    if (url.pathname.startsWith('/api/')) return json({ error: '없는 API입니다.' }, 404);
    return env.ASSETS.fetch(request);
  },
};
