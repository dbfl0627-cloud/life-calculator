import test from 'node:test'; import assert from 'node:assert/strict';
import { parseTrades, groupTrades, recentMonths, handleApt } from '../worker/index.ts';

const item = (o) => `<item><aptNm>${o.n}</aptNm><umdNm>${o.d ?? '대치동'}</umdNm><jibun>${o.j ?? '1'}</jibun><excluUseAr>${o.a}</excluUseAr><dealAmount>${o.p}</dealAmount><dealYear>${o.y ?? 2026}</dealYear><dealMonth>${o.m}</dealMonth><dealDay>${o.day ?? 5}</dealDay><floor>7</floor><buildYear>2003</buildYear><cdealType>${o.c ?? ''}</cdealType></item>`;
const xml = (items, total = items.length) => `<?xml version="1.0"?><response><header><resultCode>000</resultCode><resultMsg>OK</resultMsg></header><body><items>${items.join('')}</items><numOfRows>1000</numOfRows><pageNo>1</pageNo><totalCount>${total}</totalCount></body></response>`;

test('XML 파싱: 금액 쉼표 제거, 해제 거래 제외', () => {
  const r = parseTrades(xml([item({ n: '은마', a: '76.79', p: '  245,000', m: 9 }), item({ n: '은마', a: '76.79', p: '240,000', m: 8, c: 'O' })]));
  assert.equal(r.code, '000'); assert.equal(r.trades.length, 1);
  assert.equal(r.trades[0].price, 245000); assert.equal(r.trades[0].date, '2026-09-05');
});

test('단지·면적별 묶기: 최신 거래가와 최저·최고가', () => {
  const t = parseTrades(xml([
    item({ n: '은마', a: '76.79', p: '240,000', m: 7 }), item({ n: '은마', a: '76.79', p: '250,000', m: 9 }),
    item({ n: '은마', a: '84.43', p: '280,000', m: 8 }), item({ n: '래미안대치팰리스', a: '84.97', p: '400,000', m: 9, j: '316' }),
  ])).trades;
  const g = groupTrades(t);
  assert.deepEqual(g.map(a => a.name), ['래미안대치팰리스', '은마']);
  const em = g[1];
  assert.equal(em.types.length, 2);
  assert.deepEqual([em.types[0].area, em.types[0].count, em.types[0].latestPrice, em.types[0].minPrice, em.types[0].maxPrice], [76.8, 2, 250000, 240000, 250000]);
});

test('최근 개월 목록 (한국시간, 연도 넘김)', () => {
  assert.deepEqual(recentMonths(3, new Date('2026-02-28T16:00:00Z')), ['202603', '202602', '202601']);
  assert.deepEqual(recentMonths(2, new Date('2026-01-10T00:00:00Z')), ['202601', '202512']);
});

test('API 처리: 키 없음·잘못된 코드·정상 응답', async () => {
  let r = await handleApt(new URL('https://x/api/apt?lawd=11680'), {});
  assert.equal(r.status, 500);
  r = await handleApt(new URL('https://x/api/apt?lawd=abc'), { DATA_GO_KR_KEY: 'k' });
  assert.equal(r.status, 400);
  const calls = [];
  globalThis.fetch = async (u) => { calls.push(String(u)); return new Response(xml([item({ n: '은마', a: '76.79', p: '245,000', m: 9 })])); };
  r = await handleApt(new URL('https://x/api/apt?lawd=11680&months=2'), { DATA_GO_KR_KEY: 'k' });
  const body = await r.json();
  assert.equal(r.status, 200); assert.equal(calls.length, 2); assert.ok(calls[0].includes('LAWD_CD=11680'));
  assert.equal(body.apts[0].types[0].count, 2);
  globalThis.fetch = async () => new Response(`<response><header><resultCode>30</resultCode><resultMsg>SERVICE KEY IS NOT REGISTERED ERROR.</resultMsg></header></response>`);
  r = await handleApt(new URL('https://x/api/apt?lawd=11680&months=1'), { DATA_GO_KR_KEY: 'bad' });
  assert.equal(r.status, 502); assert.match((await r.json()).error, /30/);
});
