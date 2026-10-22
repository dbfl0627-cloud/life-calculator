import test from 'node:test';import assert from 'node:assert/strict';
// TypeScript 계산 엔진을 Node가 직접 읽을 수 있는 환경(Node 22.10+)에서 테스트합니다.
import {calculateLoan} from '../src/calc.ts';
test('무이자 1년 원리금균등',()=>{const r=calculateLoan(1200000,0,1,0,'equal-payment');assert.equal(r.length,12);assert.ok(Math.abs(r[0].payment-100000)<0.001);assert.equal(r.at(-1).balance,0)});
test('1년 거치 후 원금균등',()=>{const r=calculateLoan(2400000,12,2,1,'equal-principal');assert.equal(r[0].principal,0);assert.equal(r[0].interest,24000);assert.equal(r[12].principal,200000);assert.equal(r.at(-1).balance,0)});
test('입력 검증',()=>assert.throws(()=>calculateLoan(1000,3,10,10,'equal-payment')));
