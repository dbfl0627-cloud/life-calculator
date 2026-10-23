// 빌드 후 각 경로의 본문을 미리 렌더링(SSG)해 검색엔진이 JS 없이도 내용을 읽을 수 있게 합니다.
// canonical·OG URL·구조화 데이터(JSON-LD)·sitemap.xml도 함께 생성합니다.
import {mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const {render,ROUTES,SITE_URL,FAQ}=await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href);
const template=await readFile('dist/index.html','utf8');
const esc=s=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const jsonLd=obj=>`<script type="application/ld+json">${JSON.stringify(obj).replace(/</g,'\\u003c')}</script>`;
const calcLd=[
  {'@context':'https://schema.org','@type':'WebSite',name:'ZIPMOYA',alternateName:['집모야','zipmoya'],url:SITE_URL+'/',inLanguage:'ko'},
  {'@context':'https://schema.org','@type':'WebApplication',name:'주택담보대출 계산기 (주담대 계산기)',alternateName:['주담대 계산기','주택담보대출 계산기','ZIPMOYA','집모야'],url:SITE_URL+'/',applicationCategory:'FinanceApplication',operatingSystem:'All',inLanguage:'ko',description:ROUTES['/'].description,offers:{'@type':'Offer',price:'0',priceCurrency:'KRW'}},
  {'@context':'https://schema.org','@type':'FAQPage',mainEntity:FAQ.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))},
];
for(const [route,meta] of Object.entries(ROUTES)){
  const url=SITE_URL+meta.canonical;
  const extraHead=`<link rel="canonical" href="${url}"/><meta property="og:url" content="${url}"/><meta property="og:site_name" content="ZIPMOYA"/><meta property="og:locale" content="ko_KR"/>`
    +(meta.canonical==='/'?calcLd.map(jsonLd).join(''):'');
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
const today=new Date().toISOString().slice(0,10);
const urls=Object.values(ROUTES).filter(m=>m.inSitemap).map(m=>`  <url><loc>${SITE_URL}${m.canonical}</loc><lastmod>${today}</lastmod></url>`).join('\n');
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
await rm('dist-ssr',{recursive:true,force:true});
console.log('prerendered:',Object.keys(ROUTES).join(', '),'+ sitemap.xml, robots.txt');
