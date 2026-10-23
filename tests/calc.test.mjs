import test from 'node:test';import assert from 'node:assert/strict';
// TypeScript 계산 엔진을 Node가 직접 읽을 수 있는 환경(Node 22.10+)에서 테스트합니다.
import {calculateLoan} from '../src/calc.ts';
import {koreanAmount} from '../src/format.ts';
test('무이자 1년 원리금균등',()=>{const r=calculateLoan(1200000,0,1,0,'equal-payment');assert.equal(r.length,12);assert.ok(Math.abs(r[0].payment-100000)<0.001);assert.equal(r.at(-1).balance,0)});
test('1년 거치 후 원금균등',()=>{const r=calculateLoan(2400000,12,2,1,'equal-principal');assert.equal(r[0].principal,0);assert.equal(r[0].interest,24000);assert.equal(r[12].principal,200000);assert.equal(r.at(-1).balance,0)});
test('입력 검증',()=>assert.throws(()=>calculateLoan(1000,3,10,10,'equal-payment')));
test('이자 있는 원리금균등: 납입액 일정 + 표준 공식 일치',()=>{const P=390000000,r=4.3/1200,n=480;const expected=P*r/(1-Math.pow(1+r,-n));const rows=calculateLoan(P,4.3,40,0,'equal-payment');for(const x of rows)assert.ok(Math.abs(x.payment-expected)<0.01);assert.ok(Math.abs(rows[0].payment-1703474)<1);assert.ok(Math.abs(rows.reduce((a,x)=>a+x.principal,0)-P)<0.01)});
test('거치 후 원리금균등',()=>{const rows=calculateLoan(120000000,6,10,2,'equal-payment');const r=0.005,n=96,expected=120000000*r/(1-Math.pow(1+r,-n));assert.equal(rows[23].principal,0);assert.ok(Math.abs(rows[24].payment-expected)<0.01);assert.equal(rows.at(-1).balance,0)});
test('금액 한글 표기',()=>{assert.equal(koreanAmount(10000),'1억원');assert.equal(koreanAmount(1000),'1천만원');assert.equal(koreanAmount(39000),'3억 9천만원');assert.equal(koreanAmount(25500),'2억 5천5백만원');assert.equal(koreanAmount(12345),'1억 2천3백4십5만원');assert.equal(koreanAmount(500),'5백만원');assert.equal(koreanAmount(123456789),'1조 2천3백4십5억 6천7백8십9만원');assert.equal(koreanAmount(0),'')});
