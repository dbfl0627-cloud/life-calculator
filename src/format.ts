/** 0~9999를 "5천5백", "1천", "3십2" 같은 단위 글자 표기로 바꿉니다. */
function groupToKorean(n:number):string{
  const units:[number,string][]=[[1000,'천'],[100,'백'],[10,'십'],[1,'']];
  let out='';
  for(const [u,label] of units){const d=Math.floor(n/u)%10; if(d) out+=`${d}${label}`;}
  return out;
}
/** 만원 단위 금액을 읽기 쉬운 한글 표기로 바꿉니다. 예) 39000 → "3억 9천만원", 1000 → "1천만원", 25500 → "2억 5천5백만원" */
export function koreanAmount(man:number):string{
  if(!Number.isFinite(man)||man<=0) return '';
  const total=Math.round(man); // 만원 미만은 표시하지 않음
  if(total===0) return '';
  const jo=Math.floor(total/100000000), eok=Math.floor(total/10000)%10000, rest=total%10000;
  const parts:string[]=[];
  if(jo) parts.push(`${groupToKorean(jo)}조`);
  if(eok) parts.push(`${groupToKorean(eok)}억`);
  if(rest) parts.push(`${groupToKorean(rest)}만`);
  return parts.join(' ')+'원';
}
