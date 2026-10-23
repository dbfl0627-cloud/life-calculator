export type Method = 'equal-payment' | 'equal-principal';
export type Payment = { month:number; payment:number; principal:number; interest:number; balance:number; grace:boolean };
export function calculateLoan(amount:number, annualRate:number, years:number, graceYears:number, method:Method):Payment[]{
  if (![amount,annualRate,years,graceYears].every(Number.isFinite) || amount<=0 || annualRate<0 || annualRate>100 || !Number.isInteger(years) || years<1 || years>50 || !Number.isInteger(graceYears) || graceYears<0 || graceYears>=years) throw new Error('입력값을 확인해 주세요.');
  const months=years*12, grace=graceYears*12, r=annualRate/1200, repaymentMonths=months-grace;
  let balance=amount; const rows:Payment[]=[];
  for(let month=1;month<=months;month++){
    const interest=balance*r; let principal=0;
    if(month>grace){
      const n=months-month+1;
      if(method==='equal-principal') principal=amount/repaymentMonths;
      else principal=r===0?balance/n:balance*r/(1-Math.pow(1+r,-n))-interest; // 원리금(월 납입액)에서 이자를 뺀 금액이 원금
      principal=Math.min(balance,principal);
      if(month===months) principal=balance;
    }
    balance=Math.max(0,balance-principal);
    rows.push({month,payment:principal+interest,principal,interest,balance,grace:month<=grace});
  }
  return rows;
}
