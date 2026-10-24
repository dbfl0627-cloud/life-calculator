import { useEffect, useRef, useState } from 'react';

/**
 * 카카오맵 표시 + 주소 → 좌표 변환(브라우저에서 카카오 지도 SDK의 services 라이브러리 사용).
 * JavaScript 키는 브라우저에 노출되는 용도의 키이며, 카카오 개발자 콘솔에 등록한 도메인에서만 동작합니다.
 * REST API 키는 쓰지 않습니다.
 */
export const KAKAO_JS_KEY = '285227276213b32bfe17a97acf6d84a6';

export type MapItem = { id: string; title: string; label: string; sub?: string; address: string; keyword: string };

declare global { interface Window { kakao?: any } }

let sdkPromise: Promise<any> | null = null;
function loadKakao(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('브라우저가 아닙니다.'));
  if (window.kakao?.maps?.services) return Promise.resolve(window.kakao);
  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services&autoload=false`;
      s.async = true;
      s.onload = () => window.kakao ? window.kakao.maps.load(() => resolve(window.kakao)) : reject(new Error('카카오맵을 불러오지 못했습니다.'));
      s.onerror = () => { sdkPromise = null; reject(new Error('카카오맵 스크립트를 불러오지 못했습니다. (도메인 등록·카카오맵 사용 설정을 확인하세요)')); };
      document.head.appendChild(s);
    });
  }
  return sdkPromise;
}

/** 주소 좌표 캐시: 같은 단지를 다시 찾지 않도록 브라우저에 저장 */
const CACHE_KEY = 'zipmoya-geo-v1';
const memCache: Record<string, [number, number] | null> = (() => {
  try { return typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') : {}; } catch { return {}; }
})();
const saveCache = () => { try { localStorage.setItem(CACHE_KEY, JSON.stringify(memCache)); } catch { /* 저장 불가 환경 무시 */ } };

function geocode(kakao: any, item: MapItem): Promise<[number, number] | null> {
  if (item.address in memCache) return Promise.resolve(memCache[item.address]);
  return new Promise(resolve => {
    const done = (v: [number, number] | null) => { memCache[item.address] = v; saveCache(); resolve(v); };
    new kakao.maps.services.Geocoder().addressSearch(item.address, (res: any[], status: string) => {
      if (status === kakao.maps.services.Status.OK && res[0]) return done([Number(res[0].y), Number(res[0].x)]);
      // 지번 주소로 못 찾으면 '동 + 단지명' 키워드로 다시 검색
      new kakao.maps.services.Places().keywordSearch(item.keyword, (r2: any[], s2: string) => {
        done(s2 === kakao.maps.services.Status.OK && r2[0] ? [Number(r2[0].y), Number(r2[0].x)] : null);
      });
    });
  });
}

export function KakaoMap({ items, height = 420 }: { items: MapItem[]; height?: number }) {
  const box = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const overlays = useRef<any[]>([]);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<{ done: number; total: number; missed: number }>({ done: 0, total: 0, missed: 0 });
  const [active, setActive] = useState<MapItem | null>(null);
  const key = items.map(i => i.id + i.label).join(',');

  useEffect(() => {
    let alive = true;
    setError(''); setActive(null);
    loadKakao().then(async kakao => {
      if (!alive || !box.current) return;
      if (!mapRef.current) mapRef.current = new kakao.maps.Map(box.current, { center: new kakao.maps.LatLng(37.5665, 126.978), level: 7 });
      const map = mapRef.current;
      overlays.current.forEach(o => o.setMap(null)); overlays.current = [];
      const bounds = new kakao.maps.LatLngBounds();
      let done = 0, missed = 0, placed = 0;
      setProgress({ done: 0, total: items.length, missed: 0 });
      // 동시에 4개씩 좌표 변환
      const queue = [...items];
      const worker = async () => {
        while (queue.length && alive) {
          const it = queue.shift()!;
          const pos = await geocode(kakao, it);
          if (!alive) return;
          done++;
          if (!pos) missed++;
          else {
            const latlng = new kakao.maps.LatLng(pos[0], pos[1]);
            const el = document.createElement('button');
            el.type = 'button'; el.className = 'map-pin'; el.textContent = it.label; el.title = it.title;
            el.onclick = () => setActive(it);
            const ov = new kakao.maps.CustomOverlay({ position: latlng, content: el, yAnchor: 1.2 });
            ov.setMap(map); overlays.current.push(ov);
            bounds.extend(latlng); placed++;
            if (placed === 1) map.setCenter(latlng);
          }
          setProgress({ done, total: items.length, missed });
        }
      };
      await Promise.all([worker(), worker(), worker(), worker()]);
      if (alive && placed > 1) map.setBounds(bounds);
      else if (alive && placed === 1) map.setLevel(4);
    }).catch(e => alive && setError(e instanceof Error ? e.message : '지도를 불러오지 못했습니다.'));
    return () => { alive = false; };
  }, [key]);

  return <div className="kakao-map-wrap">
    <div ref={box} className="kakao-map" style={{ height }} role="region" aria-label="아파트 위치 지도"/>
    {error && <p role="alert" className="hint">{error}</p>}
    {!error && progress.total > 0 && progress.done < progress.total && <p className="hint">지도에 위치 표시 중… ({progress.done}/{progress.total})</p>}
    {!error && progress.missed > 0 && progress.done === progress.total && <p className="hint">{progress.missed}개 단지는 주소로 위치를 찾지 못해 지도에서 빠졌습니다.</p>}
    {active && <div className="map-active"><strong>{active.title}</strong>{active.sub && <span>{active.sub}</span>}</div>}
  </div>;
}
