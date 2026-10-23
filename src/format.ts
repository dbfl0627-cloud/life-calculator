/**
 * 0~9999를 읽기 쉬운 표기로 바꿉니다.
 * 천 자리는 "천"으로, 나머지는 백 단위로 딱 떨어지면 "백", 아니면 숫자 그대로 씁니다.
 * 예) 39 → "39", 500 → "5백", 1000 → "1천", 5500 → "5천5백", 2345 → "2천345"
 */
function groupToKorean(n:number):string{
  const thousands=Math.floor(n/1000), rest=n%1000;
  let out=thousands?`${thousands}천`:'';
  if(rest) out+=rest%100===0?`${rest/100}백`:`${rest}`;
  return out;
}
/** 만원 단위 금액을 읽기 쉬운 한글 표기로 바꿉니다. 예) 39000 → "3억 9천만원", 1000 → "1천만원", 25500 → "2억 5천5백만원", 390000 → "39억원" */
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
