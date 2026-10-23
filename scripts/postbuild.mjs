// 빌드 후 각 경로의 본문을 미리 렌더링(SSG)해 검색엔진이 JS 없이도 내용을 읽을 수 있게 합니다.
// canonical·OG URL·구조화 데이터(JSON-LD)·sitemap.xml도 함께 생성합니다.
import {mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const {render,ROUTES,SITE_URL,FAQ,DSR_FAQ,LTV_FAQ,INFO_UPDATED}=await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href);
const template=await readFile('dist/index.html','utf8');
const esc=s=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const jsonLd=obj=>`<script type="application/ld+json">${JSON.stringify(obj).replace(/</g,'\\u003c')}</script>`;
const calcLd=[
  {'@context':'https://schema.org','@type':'WebSite',name:'ZIPMOYA',alternateName:['집모야','zipmoya'],url:SITE_URL+'/',inLanguage:'ko'},
  {'@context':'https://schema.org','@type':'WebApplication',name:'주택담보대출 계산기 (주담대 계산기)',alternateName:['주담대 계산기','주택담보대출 계산기','ZIPMOYA','집모야'],url:SITE_URL+'/',applicationCategory:'FinanceApplication',dateModified:INFO_UPDATED,operatingSystem:'All',inLanguage:'ko',description:ROUTES['/'].description,offers:{'@type':'Offer',price:'0',priceCurrency:'KRW'}},
  {'@context':'https://schema.org','@type':'FAQPage',mainEntity:FAQ.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))},
];
const dsrLd={'@context':'https://schema.org','@type':'WebApplication',name:'DSR 계산기',alternateName:['DSR 계산기','총부채원리금상환비율 계산기','대출한도 계산기'],url:SITE_URL+'/dsr/',applicationCategory:'FinanceApplication',dateModified:INFO_UPDATED,operatingSystem:'All',inLanguage:'ko',description:ROUTES['/dsr/'].description,offers:{'@type':'Offer',price:'0',priceCurrency:'KRW'}};
const ltvLd={'@context':'https://schema.org','@type':'WebApplication',name:'LTV 계산기',alternateName:['LTV 계산기','주택담보인정비율 계산기','담보대출 한도 계산기'],url:SITE_URL+'/ltv/',applicationCategory:'FinanceApplication',dateModified:INFO_UPDATED,operatingSystem:'All',inLanguage:'ko',description:ROUTES['/ltv/'].description,offers:{'@type':'Offer',price:'0',priceCurrency:'KRW'}};
const faqLd=list=>({'@context':'https://schema.org','@type':'FAQPage',mainEntity:list.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))});
for(const [route,meta] of Object.entries(ROUTES)){
  const url=SITE_URL+meta.canonical;
  const extraHead=`<link rel="canonical" href="${url}"/><meta property="og:url" content="${url}"/><meta property="og:site_name" content="ZIPMOYA"/><meta property="og:locale" content="ko_KR"/>`
    +`<meta property="og:image" content="${SITE_URL}${meta.ogImage??'/og/default.png'}"/><meta property="og:image:width" content="1200"/><meta property="og:image:height" content="630"/><meta property="og:image:alt" content="${esc(meta.title)}"/>`
    +`<meta name="twitter:card" content="summary_large_image"/><meta name="twitter:title" content="${esc(meta.title)}"/><meta name="twitter:description" content="${esc(meta.description)}"/><meta name="twitter:image" content="${SITE_URL}${meta.ogImage??'/og/default.png'}"/>`
    +(meta.canonical==='/'?calcLd.map(jsonLd).join(''):'')
    +(route==='/dsr/'?jsonLd(dsrLd)+jsonLd(faqLd(DSR_FAQ)):'')
    +(route==='/ltv/'?jsonLd(ltvLd)+jsonLd(faqLd(LTV_FAQ)):'');
  let html=template.replace(/<link rel="canonical"[^>]*>/,"")
    .replace(/<title>.*?<\/title>/,`<title>${esc(meta.title)}</title>${extraHead}`)
    .replace(/(<meta name="description" content=")[^"]*/,`$1${esc(meta.description)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/,`$1${esc(meta.title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/,`$1${esc(meta.description)}`)
    .replace('<div id="root"></div>',`<div id="root">${render(route)}</div>`);
  const dir=route==='/'?'dist':`dist${route}`;
  await mkdir(dir,{recursive:true});
  await writeFile(`${dir}/index.html`,html);
}
// 404 페이지: 검색엔진이 색인하지 않도록 noindex, canonical 없음
{
  const html=template.replace(/<link rel="canonical"[^>]*>/,'')
    .replace(/<title>.*?<\/title>/,'<title>페이지를 찾을 수 없습니다 | ZIPMOYA</title><meta name="robots" content="noindex"/>')
    .replace('<div id="root"></div>',`<div id="root">${render('/404/')}</div>`);
  await writeFile('dist/404.html',html);
}
// AI 검색용 사이트 안내 파일 (llms.txt)
await writeFile('dist/llms.txt',`# ZIPMOYA (집모야)

> 주택담보대출(주담대), DSR, LTV를 무료로 계산하는 한국어 부동산 대출 계산기 사이트입니다. 모든 계산은 이용자의 브라우저에서 이루어지며 각 페이지에 계산식과 예시 표를 공개합니다. 정보 기준일: ${INFO_UPDATED}

## 계산기
- [주담대 계산기](${SITE_URL}/): 대출금액·금리·기간·거치기간으로 원리금균등/원금균등 월 상환액, 총 이자, 월별 상환표 계산. 대출금액·기간별 월 상환액 예시 표 포함.
- [DSR 계산기](${SITE_URL}/dsr/): 연소득과 기존 대출 원리금으로 DSR 비율과 신규 대출한도 계산. 스트레스 DSR 1~3단계, 지역·금리유형별 반영비율, 연봉별 DSR 40% 한도 예시 표 포함.
- [LTV 계산기](${SITE_URL}/ltv/): 주택가격과 LTV 비율로 담보가치 기준 대출한도, 기존 대출 차감 후 추가 한도, 부족 자금 계산. 집값별 LTV 한도 예시 표 포함.

## 안내
- [사이트 소개](${SITE_URL}/about/)
- [개인정보처리방침](${SITE_URL}/privacy/)

## 유의사항
계산 결과는 입력 조건에 따른 추정치이며 실제 대출 가능 금액은 금융기관 심사와 지역·상품별 규제에 따라 다릅니다. ZIPMOYA는 금융 자문을 제공하지 않습니다.
`);
const today=new Date().toISOString().slice(0,10);
const urls=Object.values(ROUTES).filter(m=>m.inSitemap).map(m=>`  <url><loc>${SITE_URL}${m.canonical}</loc><lastmod>${today}</lastmod></url>`).join('\n');
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
await rm('dist-ssr',{recursive:true,force:true});
console.log('prerendered:',Object.keys(ROUTES).join(', '),'+ sitemap.xml, robots.txt, llms.txt');
