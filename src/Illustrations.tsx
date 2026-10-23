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
export function MortgageIllustration() {
  return <Frame id="illust-mortgage" title="집과 상환 달력, 줄어드는 대출 잔액을 표현한 주담대 계산기 일러스트">
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
export function DsrIllustration() {
  // 게이지: 반원(180°) 중 40%를 채운 호
  const cx = 290, cy = 178, r = 72, pct = 0.4;
  const end = Math.PI * (1 - pct);
  const ex = cx + r * Math.cos(end), ey = cy - r * Math.sin(end);
  return <Frame id="illust-dsr" title="연봉 카드와 DSR 비율 게이지를 표현한 DSR 계산기 일러스트">
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
export function LtvIllustration() {
  return <Frame id="illust-ltv" title="집값 대비 대출 비율 막대와 열쇠를 표현한 LTV 계산기 일러스트">
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
export function NotFoundIllustration() {
  return <Frame id="illust-404" title="길을 잃은 집과 표지판으로 표현한 페이지 없음(404) 일러스트">
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
