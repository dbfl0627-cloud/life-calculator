/**
 * 각 계산기 페이지 상단에 쓰는 일러스트. 외부 이미지 없이 SVG 도형으로 그려 가볍고 저작권 걱정이 없습니다.
 * 색상은 사이트 기본 팔레트(#0b2545, #0d4177, #216baa, #4f93cf, #d4e5f4, #eef5fc)를 사용합니다.
 */
const FONT = 'system-ui, -apple-system, sans-serif';

function Frame({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return <svg className="hero-illust" viewBox="0 0 420 300" role="img" aria-labelledby={id}>
    <title id={id}>{title}</title>
    <rect width="420" height="300" rx="24" fill="#eef5fc"/>
    <rect x="30" y="250" width="360" height="10" rx="5" fill="#d4e5f4"/>
    {children}
  </svg>;
}

/** 주담대: 집 + 상환 달력 + 줄어드는 잔액 그래프 + 동전 */
export function MortgageIllustration({ uid = '' }: { uid?: string } = {}) {
  return <Frame id={`illust-mortgage${uid}`} title="집과 상환 달력, 줄어드는 대출 잔액을 표현한 주담대 계산기 일러스트">
    <circle cx="70" cy="58" r="22" fill="#d4e5f4"/>
    {/* 집 */}
    <path d="M40 160 L120 98 L200 160 Z" fill="#0d4177"/>
    <rect x="54" y="156" width="132" height="94" rx="6" fill="#fff" stroke="#c9d9ea" strokeWidth="2"/>
    <rect x="70" y="176" width="34" height="30" rx="4" fill="#d4e5f4"/>
    <path d="M87 176 V206 M70 191 H104" stroke="#fff" strokeWidth="3"/>
    <rect x="126" y="192" width="40" height="58" rx="4" fill="#216baa"/>
    <circle cx="158" cy="222" r="3" fill="#fff"/>
    {/* 달력 */}
    <rect x="226" y="44" width="150" height="118" rx="14" fill="#fff" stroke="#c9d9ea" strokeWidth="2"/>
    <rect x="226" y="44" width="150" height="30" rx="14" fill="#216baa"/>
    <rect x="226" y="60" width="150" height="14" fill="#216baa"/>
    <rect x="252" y="36" width="8" height="18" rx="4" fill="#0b2545"/>
    <rect x="342" y="36" width="8" height="18" rx="4" fill="#0b2545"/>
    {[0, 1, 2].map(r => [0, 1, 2, 3].map(c => {
      const done = r * 4 + c < 6;
      return <g key={`${r}-${c}`}>
        <rect x={242 + c * 32} y={86 + r * 24} width="22" height="16" rx="4" fill={done ? '#4f93cf' : '#e8f3ff'}/>
        {done && <path d={`M${247 + c * 32} ${94 + r * 24} l4 4 l7 -8`} stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>}
      </g>;
    }))}
    {/* 줄어드는 잔액 */}
    <rect x="226" y="176" width="150" height="62" rx="12" fill="#fff" stroke="#c9d9ea" strokeWidth="2"/>
    <path d="M242 194 C278 198 306 210 360 226" stroke="#216baa" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <circle cx="360" cy="226" r="5" fill="#216baa"/>
    <text x="244" y="230" fontSize="11" fontWeight="700" fill="#7a8a9c" fontFamily={FONT}>잔액</text>
    {/* 동전 */}
    {[0, 1, 2].map(i => <ellipse key={i} cx="208" cy={244 - i * 9} rx="18" ry="6" fill={i === 2 ? '#f2c14e' : '#e0a92e'} stroke="#c98f1c" strokeWidth="1.5"/>)}
  </Frame>;
}

/** DSR: 연봉 카드 + DSR 게이지 + 동전 */
export function DsrIllustration({ uid = '' }: { uid?: string } = {}) {
  // 게이지: 반원(180°) 중 40%를 채운 호
  const cx = 290, cy = 178, r = 72, pct = 0.4;
  const end = Math.PI * (1 - pct);
  const ex = cx + r * Math.cos(end), ey = cy - r * Math.sin(end);
  return <Frame id={`illust-dsr${uid}`} title="연봉 카드와 DSR 비율 게이지를 표현한 DSR 계산기 일러스트">
    <circle cx="364" cy="56" r="24" fill="#d4e5f4"/>
    {/* 연봉 카드 */}
    <g transform="rotate(-6 120 150)">
      <rect x="40" y="86" width="160" height="112" rx="14" fill="#0b2545"/>
      <text x="58" y="116" fontSize="13" fontWeight="700" fill="#bcd6ee" fontFamily={FONT}>연소득</text>
      <rect x="58" y="128" width="96" height="12" rx="6" fill="#4f93cf"/>
      <rect x="58" y="148" width="64" height="10" rx="5" fill="#3a5878"/>
      <rect x="58" y="166" width="84" height="10" rx="5" fill="#3a5878"/>
      <circle cx="176" cy="112" r="10" fill="#f2c14e"/>
    </g>
    {/* 게이지 */}
    <rect x="200" y="78" width="180" height="150" rx="16" fill="#fff" stroke="#c9d9ea" strokeWidth="2"/>
    <path d={`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy}`} stroke="#e8f3ff" strokeWidth="18" fill="none" strokeLinecap="round"/>
    <path d={`M${cx - r} ${cy} A${r} ${r} 0 0 1 ${ex.toFixed(1)} ${ey.toFixed(1)}`} stroke="#216baa" strokeWidth="18" fill="none" strokeLinecap="round"/>
    <line x1={cx} y1={cy} x2={cx + (r - 22) * Math.cos(end)} y2={cy - (r - 22) * Math.sin(end)} stroke="#0b2545" strokeWidth="4" strokeLinecap="round"/>
    <circle cx={cx} cy={cy} r="7" fill="#0b2545"/>
    <text x={cx} y="214" textAnchor="middle" fontSize="15" fontWeight="800" fill="#0b4e8b" fontFamily={FONT}>DSR 40%</text>
    {/* 동전 */}
    {[0, 1, 2, 3].map(i => <ellipse key={i} cx="120" cy={244 - i * 9} rx="20" ry="6.5" fill={i === 3 ? '#f2c14e' : '#e0a92e'} stroke="#c98f1c" strokeWidth="1.5"/>)}
    {[0, 1].map(i => <ellipse key={i} cx="70" cy={244 - i * 9} rx="20" ry="6.5" fill={i === 1 ? '#f2c14e' : '#e0a92e'} stroke="#c98f1c" strokeWidth="1.5"/>)}
  </Frame>;
}

/** LTV: 집 + 담보가치 대비 대출 비율 막대 + 열쇠 */
export function LtvIllustration({ uid = '' }: { uid?: string } = {}) {
  return <Frame id={`illust-ltv${uid}`} title="집값 대비 대출 비율 막대와 열쇠를 표현한 LTV 계산기 일러스트">
    <circle cx="352" cy="52" r="22" fill="#d4e5f4"/>
    {/* 큰 집 */}
    <path d="M60 136 L160 64 L260 136 Z" fill="#0d4177"/>
    <rect x="76" y="132" width="168" height="118" rx="6" fill="#fff" stroke="#c9d9ea" strokeWidth="2"/>
    <rect x="94" y="152" width="38" height="32" rx="4" fill="#d4e5f4"/>
    <path d="M113 152 V184 M94 168 H132" stroke="#fff" strokeWidth="3"/>
    <rect x="188" y="152" width="38" height="32" rx="4" fill="#d4e5f4"/>
    <path d="M207 152 V184 M188 168 H226" stroke="#fff" strokeWidth="3"/>
    <rect x="140" y="194" width="40" height="56" rx="4" fill="#216baa"/>
    <circle cx="172" cy="224" r="3" fill="#fff"/>
    {/* LTV 막대 카드 */}
    <rect x="270" y="100" width="122" height="118" rx="14" fill="#fff" stroke="#c9d9ea" strokeWidth="2"/>
    <text x="331" y="126" textAnchor="middle" fontSize="12" fontWeight="700" fill="#7a8a9c" fontFamily={FONT}>집값 대비 대출</text>
    <rect x="312" y="136" width="38" height="70" rx="6" fill="#e8f3ff"/>
    <rect x="312" y="157" width="38" height="49" rx="6" fill="#216baa"/>
    <text x="331" y="186" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff" fontFamily={FONT}>70%</text>
    {/* 열쇠 */}
    <g transform="rotate(-20 330 248)">
      <circle cx="300" cy="246" r="14" fill="none" stroke="#e0a92e" strokeWidth="7"/>
      <rect x="312" y="242" width="54" height="8" rx="3" fill="#e0a92e"/>
      <rect x="350" y="250" width="7" height="11" rx="2" fill="#e0a92e"/>
      <rect x="338" y="250" width="7" height="8" rx="2" fill="#e0a92e"/>
    </g>
  </Frame>;
}

/** 404: 길 잃은 집 — 표지판, 물음표, 돋보기 */
export function NotFoundIllustration({ uid = '' }: { uid?: string } = {}) {
  return <Frame id={`illust-404${uid}`} title="길을 잃은 집과 표지판으로 표현한 페이지 없음(404) 일러스트">
    <circle cx="352" cy="54" r="22" fill="#d4e5f4"/>
    {/* 404 숫자 */}
    <text x="210" y="92" textAnchor="middle" fontSize="64" fontWeight="900" fill="#d4e5f4" fontFamily={FONT} letterSpacing="4">404</text>
    {/* 집 */}
    <path d="M52 168 L122 114 L192 168 Z" fill="#0d4177"/>
    <rect x="66" y="164" width="112" height="86" rx="6" fill="#fff" stroke="#c9d9ea" strokeWidth="2"/>
    <rect x="80" y="182" width="30" height="26" rx="4" fill="#d4e5f4"/>
    <path d="M95 182 V208 M80 195 H110" stroke="#fff" strokeWidth="3"/>
    <rect x="124" y="196" width="36" height="54" rx="4" fill="#216baa"/>
    <circle cx="153" cy="224" r="3" fill="#fff"/>
    {/* 말풍선 물음표 */}
    <rect x="150" y="104" width="46" height="42" rx="12" fill="#f2c14e"/>
    <path d="M164 146 L160 158 L174 146 Z" fill="#f2c14e"/>
    <text x="173" y="136" textAnchor="middle" fontSize="26" fontWeight="900" fill="#0b2545" fontFamily={FONT}>?</text>
    {/* 갈림길 표지판 */}
    <rect x="292" y="120" width="8" height="130" rx="3" fill="#7a8a9c"/>
    <path d="M232 128 H330 L346 142 L330 156 H232 Z" fill="#216baa"/>
    <text x="284" y="147" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff" fontFamily={FONT}>계산기</text>
    <path d="M360 170 H262 L246 184 L262 198 H360 Z" fill="#0b2545"/>
    <text x="308" y="189" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff" fontFamily={FONT}>홈으로</text>
    {/* 돋보기 */}
    <circle cx="226" cy="226" r="18" fill="#e8f3ff" stroke="#0b2545" strokeWidth="6"/>
    <rect x="238" y="238" width="22" height="8" rx="4" fill="#0b2545" transform="rotate(45 240 240)"/>
  </Frame>;
}

/** 내 집 찾기: 지도 위 핀과 아파트 */
export function FindHomeIllustration({ uid = '' }: { uid?: string } = {}) {
  return <Frame id={`illust-findhome${uid}`} title="지도 위에 아파트와 위치 핀을 표현한 내 집 찾기 일러스트">
    {/* 지도 */}
    <path d="M40 70 L140 50 L250 74 L380 52 L380 236 L250 258 L140 234 L40 254 Z" fill="#fff" stroke="#c9d9ea" strokeWidth="2"/>
    <path d="M140 50 V234 M250 74 V258" stroke="#e1eaf3" strokeWidth="2"/>
    <path d="M40 170 C110 150 170 200 250 170 S350 140 380 150" stroke="#d4e5f4" strokeWidth="10" fill="none" strokeLinecap="round"/>
    {/* 아파트들 */}
    {[[70, 120, 34, 70], [112, 100, 30, 90], [270, 112, 36, 78], [314, 132, 30, 58]].map(([x, y, w, h], i) =>
      <g key={i}>
        <rect x={x} y={y} width={w} height={h} rx="4" fill={i % 2 ? '#4f93cf' : '#216baa'}/>
        {Array.from({ length: Math.floor((h - 12) / 14) }).map((_, r) => <rect key={r} x={x + 7} y={y + 8 + r * 14} width={w - 14} height="6" rx="2" fill="#e8f3ff" opacity=".8"/>)}
      </g>)}
    {/* 핀 */}
    <g transform="translate(196 78)">
      <path d="M0 0 C-26 0 -38 22 -30 42 L0 92 L30 42 C38 22 26 0 0 0 Z" fill="#f2c14e"/>
      <circle cx="0" cy="32" r="13" fill="#fff"/>
      <path d="M-7 34 L0 27 L7 34 V40 H-7 Z" fill="#0b2545"/>
    </g>
    <ellipse cx="196" cy="176" rx="18" ry="5" fill="#0b2545" opacity=".15"/>
  </Frame>;
}

/** 금리: 오르내리는 금리 그래프와 % 배지 */
export function RateIllustration({ uid = '' }: { uid?: string } = {}) {
  return <Frame id={`illust-rate${uid}`} title="오르내리는 금리 그래프와 퍼센트 배지로 표현한 금리 일러스트">
    <rect x="50" y="56" width="270" height="176" rx="14" fill="#fff" stroke="#c9d9ea" strokeWidth="2"/>
    {[0, 1, 2, 3].map(i => <line key={i} x1="70" x2="300" y1={88 + i * 38} y2={88 + i * 38} stroke="#eef3f8" strokeWidth="2"/>)}
    <path d="M70 196 L120 170 L160 182 L205 132 L245 146 L295 92" stroke="#216baa" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M70 196 L120 170 L160 182 L205 132 L245 146 L295 92 L295 220 L70 220 Z" fill="#216baa" opacity=".08"/>
    {[[120, 170], [205, 132], [295, 92]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="6" fill="#fff" stroke="#216baa" strokeWidth="3"/>)}
    <circle cx="336" cy="86" r="40" fill="#f2c14e"/>
    <text x="336" y="100" textAnchor="middle" fontSize="40" fontWeight="900" fill="#0b2545" fontFamily={FONT}>%</text>
    <path d="M330 168 l22 -26 l22 26 h-12 v34 h-20 v-34 Z" fill="#0d4177"/>
  </Frame>;
}

/** 부대비용: 영수증과 동전, 계산기 */
export function CostIllustration({ uid = '' }: { uid?: string } = {}) {
  return <Frame id={`illust-cost${uid}`} title="영수증과 동전으로 표현한 아파트 구입 부대비용 일러스트">
    <path d="M90 40 H250 V236 L234 226 L218 236 L202 226 L186 236 L170 226 L154 236 L138 226 L122 236 L106 226 L90 236 Z" fill="#fff" stroke="#c9d9ea" strokeWidth="2"/>
    <text x="170" y="74" textAnchor="middle" fontSize="15" fontWeight="800" fill="#0b2545" fontFamily={FONT}>구입 비용</text>
    {['취득세', '중개보수', '등기비', '이사비'].map((t, i) => <g key={t}>
      <text x="108" y={108 + i * 28} fontSize="12" fontWeight="700" fill="#65768b" fontFamily={FONT}>{t}</text>
      <rect x="176" y={98 + i * 28} width={56 - i * 8} height="10" rx="5" fill={i ? '#bcd6ee' : '#216baa'}/>
    </g>)}
    <line x1="108" x2="232" y1="212" y2="212" stroke="#c9d9ea" strokeWidth="2" strokeDasharray="4 4"/>
    {[0, 1, 2, 3, 4].map(i => <ellipse key={i} cx="304" cy={236 - i * 10} rx="30" ry="9" fill={i === 4 ? '#f2c14e' : '#e0a92e'} stroke="#c98f1c" strokeWidth="1.5"/>)}
    {[0, 1, 2].map(i => <ellipse key={i} cx="356" cy={236 - i * 10} rx="24" ry="8" fill={i === 2 ? '#f2c14e' : '#e0a92e'} stroke="#c98f1c" strokeWidth="1.5"/>)}
    <circle cx="350" cy="70" r="24" fill="#d4e5f4"/>
  </Frame>;
}

/* ───────── 가이드 전용 일러스트 (글마다 하나씩) ───────── */
type U = { uid?: string };
const coin = (cx: number, cy: number, i: number, top: boolean, rx = 20) =>
  <ellipse key={`${cx}-${i}`} cx={cx} cy={cy} rx={rx} ry={rx * 0.32} fill={top ? '#f2c14e' : '#e0a92e'} stroke="#c98f1c" strokeWidth="1.5"/>;

/** 자금 계획 5단계: 계단을 올라 집에 도착 */
export function StepsIllustration({ uid = '' }: U = {}) {
  return <Frame id={`illust-steps${uid}`} title="다섯 단계 계단을 올라 집에 도착하는 내 집 마련 자금 계획 일러스트">
    {[0, 1, 2, 3, 4].map(i => <g key={i}>
      <rect x={50 + i * 52} y={210 - i * 30} width="52" height={40 + i * 30} fill={i % 2 ? '#4f93cf' : '#216baa'}/>
      <text x={76 + i * 52} y={232 - i * 30} textAnchor="middle" fontSize="16" fontWeight="900" fill="#fff" fontFamily={FONT}>{i + 1}</text>
    </g>)}
    <path d="M300 92 L340 60 L380 92 Z" fill="#0b2545"/>
    <rect x="310" y="90" width="60" height="40" rx="3" fill="#fff" stroke="#c9d9ea" strokeWidth="2"/>
    <rect x="332" y="104" width="16" height="26" rx="2" fill="#f2c14e"/>
    <path d="M330 150 l10 10 l22 -24" stroke="#17663a" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </Frame>;
}

/** 연봉별 한도: 연봉 막대가 커질수록 대출한도 막대도 커짐 */
export function SalaryIllustration({ uid = '' }: U = {}) {
  return <Frame id={`illust-salary${uid}`} title="연봉이 오를수록 커지는 대출한도 막대 그래프 일러스트">
    <rect x="44" y="40" width="250" height="196" rx="14" fill="#fff" stroke="#c9d9ea" strokeWidth="2"/>
    {[0, 1, 2, 3].map(i => <g key={i}>
      <rect x={70 + i * 54} y={200 - (i + 1) * 18} width="18" height={(i + 1) * 18} rx="3" fill="#bcd6ee"/>
      <rect x={90 + i * 54} y={200 - (i + 1) * 34} width="18" height={(i + 1) * 34} rx="3" fill="#216baa"/>
    </g>)}
    <line x1="62" x2="280" y1="200" y2="200" stroke="#c9d9ea" strokeWidth="2"/>
    <text x="72" y="222" fontSize="11" fontWeight="700" fill="#7a8a9c" fontFamily={FONT}>연봉 ↑ → 한도 ↑</text>
    {/* 월급 봉투 */}
    <g transform="rotate(8 340 140)">
      <rect x="300" y="104" width="86" height="60" rx="8" fill="#fff" stroke="#0b2545" strokeWidth="3"/>
      <path d="M300 112 L343 140 L386 112" stroke="#0b2545" strokeWidth="3" fill="none"/>
      <text x="343" y="186" textAnchor="middle" fontSize="14" fontWeight="900" fill="#0b2545" fontFamily={FONT}>연봉</text>
    </g>
    {[0, 1, 2].map(i => coin(344, 236 - i * 9, i, i === 2))}
  </Frame>;
}

/** 스트레스 DSR: 온도계처럼 올라가는 스트레스 금리와 줄어드는 한도 */
export function StressIllustration({ uid = '' }: U = {}) {
  return <Frame id={`illust-stress${uid}`} title="온도계처럼 올라가는 스트레스 금리와 줄어드는 대출한도 일러스트">
    {/* 온도계 */}
    <rect x="88" y="48" width="36" height="160" rx="18" fill="#fff" stroke="#c9d9ea" strokeWidth="3"/>
    <circle cx="106" cy="214" r="28" fill="#c62828"/>
    <rect x="98" y="96" width="16" height="118" rx="8" fill="#c62828"/>
    {[0, 1, 2].map(i => <line key={i} x1="128" x2="142" y1={80 + i * 36} y2={80 + i * 36} stroke="#7a8a9c" strokeWidth="3" strokeLinecap="round"/>)}
    <text x="150" y="86" fontSize="13" fontWeight="800" fill="#c62828" fontFamily={FONT}>+3.0%p</text>
    <text x="150" y="122" fontSize="13" fontWeight="800" fill="#e0a92e" fontFamily={FONT}>+1.5%p</text>
    {/* 줄어드는 한도 막대 */}
    <rect x="236" y="56" width="140" height="160" rx="14" fill="#fff" stroke="#c9d9ea" strokeWidth="2"/>
    {[1, 0.82, 0.68].map((h, i) => <rect key={i} x={256 + i * 40} y={196 - 120 * h} width="26" height={120 * h} rx="4" fill={['#216baa', '#4f93cf', '#bcd6ee'][i]}/>)}
    <path d="M262 64 L350 104" stroke="#c62828" strokeWidth="3" strokeDasharray="5 5"/>
    <path d="M350 104 l-12 0 m12 0 l-4 -11" stroke="#c62828" strokeWidth="3" strokeLinecap="round"/>
  </Frame>;
}

/** LTV·DSR·DTI: 세 장의 카드 비교 */
export function CompareRatioIllustration({ uid = '' }: U = {}) {
  const cards = [{ t: 'LTV', s: '집값', c: '#216baa' }, { t: 'DTI', s: '소득', c: '#4f93cf' }, { t: 'DSR', s: '모든 대출', c: '#0b2545' }];
  return <Frame id={`illust-ratio${uid}`} title="LTV, DTI, DSR 세 가지 기준을 카드로 비교한 일러스트">
    {cards.map((k, i) => <g key={k.t} transform={`rotate(${(i - 1) * 6} ${110 + i * 100} 150)`}>
      <rect x={60 + i * 100} y="70" width="100" height="140" rx="14" fill="#fff" stroke="#c9d9ea" strokeWidth="2"/>
      <rect x={60 + i * 100} y="70" width="100" height="44" rx="14" fill={k.c}/>
      <rect x={60 + i * 100} y="98" width="100" height="16" fill={k.c}/>
      <text x={110 + i * 100} y="100" textAnchor="middle" fontSize="20" fontWeight="900" fill="#fff" fontFamily={FONT}>{k.t}</text>
      <text x={110 + i * 100} y="146" textAnchor="middle" fontSize="13" fontWeight="800" fill="#2c3e55" fontFamily={FONT}>{k.s}</text>
      <rect x={80 + i * 100} y="164" width="60" height="8" rx="4" fill="#e8f3ff"/>
      <rect x={80 + i * 100} y="164" width={[42, 30, 50][i]} height="8" rx="4" fill={k.c}/>
      <rect x={80 + i * 100} y="182" width="44" height="8" rx="4" fill="#e8f3ff"/>
    </g>)}
  </Frame>;
}

/** 원리금균등 vs 원금균등: 일정한 막대 vs 줄어드는 막대 */
export function RepaymentIllustration({ uid = '' }: U = {}) {
  return <Frame id={`illust-repay${uid}`} title="일정한 원리금균등 막대와 점점 줄어드는 원금균등 막대를 비교한 일러스트">
    {[0, 1].map(side => <g key={side}>
      <rect x={40 + side * 180} y="48" width="160" height="176" rx="14" fill="#fff" stroke="#c9d9ea" strokeWidth="2"/>
      <text x={120 + side * 180} y="74" textAnchor="middle" fontSize="13" fontWeight="800" fill="#2c3e55" fontFamily={FONT}>{side ? '원금균등' : '원리금균등'}</text>
      {[0, 1, 2, 3, 4].map(i => {
        const h = side ? 110 - i * 18 : 80;
        return <g key={i}>
          <rect x={60 + side * 180 + i * 26} y={206 - h} width="18" height={h} rx="3" fill={side ? '#4f93cf' : '#216baa'}/>
          <rect x={60 + side * 180 + i * 26} y={206 - h} width="18" height={side ? Math.max(8, 40 - i * 8) : 44 - i * 8} rx="3" fill="#f2c14e"/>
        </g>;
      })}
    </g>)}
    <text x="210" y="258" textAnchor="middle" fontSize="11" fontWeight="700" fill="#7a8a9c" fontFamily={FONT}>■ 원금  ■ 이자</text>
  </Frame>;
}

/** 대출기간: 30·40·50년 타임라인과 모래시계 */
export function TermIllustration({ uid = '' }: U = {}) {
  return <Frame id={`illust-term${uid}`} title="30년, 40년, 50년 대출기간 타임라인과 모래시계 일러스트">
    {[30, 40, 50].map((y, i) => <g key={y}>
      <text x="48" y={86 + i * 52} fontSize="14" fontWeight="900" fill="#0b2545" fontFamily={FONT}>{y}년</text>
      <rect x="96" y={74 + i * 52} width="196" height="16" rx="8" fill="#e8f3ff"/>
      <rect x="96" y={74 + i * 52} width={110 + i * 42} height="16" rx="8" fill={['#bcd6ee', '#4f93cf', '#216baa'][i]}/>
    </g>)}
    {/* 모래시계 */}
    <rect x="318" y="58" width="64" height="10" rx="5" fill="#0b2545"/>
    <rect x="318" y="210" width="64" height="10" rx="5" fill="#0b2545"/>
    <path d="M326 68 H374 C374 110 352 124 350 139 C352 154 374 168 374 210 H326 C326 168 348 154 350 139 C348 124 326 110 326 68 Z" fill="#fff" stroke="#c9d9ea" strokeWidth="3"/>
    <path d="M336 84 H364 C362 104 352 116 350 128 C348 116 338 104 336 84 Z" fill="#f2c14e"/>
    <path d="M330 206 C334 186 344 178 350 176 C356 178 366 186 370 206 Z" fill="#e0a92e"/>
  </Frame>;
}

/** 거치기간: 일시정지 버튼과 이자만 내는 달력 */
export function GraceIllustration({ uid = '' }: U = {}) {
  return <Frame id={`illust-grace${uid}`} title="일시정지 버튼과 이자만 표시된 달력으로 표현한 거치기간 일러스트">
    <circle cx="124" cy="140" r="70" fill="#0b2545"/>
    <rect x="100" y="106" width="16" height="68" rx="5" fill="#fff"/>
    <rect x="132" y="106" width="16" height="68" rx="5" fill="#fff"/>
    <text x="124" y="236" textAnchor="middle" fontSize="13" fontWeight="800" fill="#65768b" fontFamily={FONT}>원금 상환 일시정지</text>
    <rect x="226" y="58" width="150" height="150" rx="14" fill="#fff" stroke="#c9d9ea" strokeWidth="2"/>
    <rect x="226" y="58" width="150" height="30" rx="14" fill="#216baa"/>
    <rect x="226" y="74" width="150" height="14" fill="#216baa"/>
    {[0, 1, 2].map(r => [0, 1, 2].map(c => {
      const interestOnly = r === 0;
      return <g key={`${r}${c}`}>
        <rect x={242 + c * 42} y={100 + r * 34} width="34" height="24" rx="5" fill={interestOnly ? '#fdf3d7' : '#e8f3ff'}/>
        <text x={259 + c * 42} y={117 + r * 34} textAnchor="middle" fontSize="11" fontWeight="800" fill={interestOnly ? '#b07d10' : '#216baa'} fontFamily={FONT}>{interestOnly ? '이자' : '원+이'}</text>
      </g>;
    }))}
  </Frame>;
}

/** 실거래가 vs KB시세: 두 개의 가격표 비교 */
export function PriceTagIllustration({ uid = '' }: U = {}) {
  return <Frame id={`illust-tag${uid}`} title="실거래가와 시세 두 가격표를 비교한 일러스트">
    {[{ x: 58, r: -8, t: '실거래가', c: '#216baa', v: '9.8억' }, { x: 222, r: 7, t: '시세', c: '#0b2545', v: '10.1억' }].map(k =>
      <g key={k.t} transform={`rotate(${k.r} ${k.x + 70} 140)`}>
        <path d={`M${k.x} 80 H${k.x + 110} L${k.x + 140} 140 L${k.x + 110} 200 H${k.x} Z`} fill="#fff" stroke={k.c} strokeWidth="3"/>
        <circle cx={k.x + 116} cy="140" r="8" fill="#eef5fc" stroke={k.c} strokeWidth="3"/>
        <text x={k.x + 52} y="124" textAnchor="middle" fontSize="14" fontWeight="800" fill="#65768b" fontFamily={FONT}>{k.t}</text>
        <text x={k.x + 52} y="162" textAnchor="middle" fontSize="26" fontWeight="900" fill={k.c} fontFamily={FONT}>{k.v}</text>
      </g>)}
    <text x="210" y="246" textAnchor="middle" fontSize="13" fontWeight="800" fill="#7a8a9c" fontFamily={FONT}>무엇을 기준으로 볼까?</text>
  </Frame>;
}
