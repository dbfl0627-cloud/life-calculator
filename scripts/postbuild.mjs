// 빌드 후 각 경로의 본문을 미리 렌더링(SSG)해 검색엔진이 JS 없이도 내용을 읽을 수 있게 합니다.
import {mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const {render,ROUTES}=await import(pathToFileURL(resolve('dist-ssr/entry-server.js')).href);
const template=await readFile('dist/index.html','utf8');
const esc=s=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
for(const [route,meta] of Object.entries(ROUTES)){
  let html=template
    .replace(/<title>.*?<\/title>/,`<title>${esc(meta.title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/,`$1${esc(meta.description)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/,`$1${esc(meta.title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/,`$1${esc(meta.description)}`)
    .replace('<div id="root"></div>',`<div id="root">${render(route)}</div>`);
  const dir=route==='/'?'dist':`dist${route}`;
  await mkdir(dir,{recursive:true});
  await writeFile(`${dir}/index.html`,html);
}
await rm('dist-ssr',{recursive:true,force:true});
console.log('prerendered:',Object.keys(ROUTES).join(', '));
