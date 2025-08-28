import { describe, it, expect } from 'vitest';
import { yiqihua } from '../yiqihua.js';

describe('yiqihua', () => {
  it('handles empty input', () => {
    const result = yiqihua({ individuals: [] });
    expect(result.totalAmount).toBe(0);
    expect(result.averageAmount).toBe(0);
    expect(result.settlements).toEqual([]);
  });

  it('returns no settlements when everyone spent equally', () => {
    const result = yiqihua({
      individuals: [
        { name: 'Alice', amountSpent: 10 },
        { name: 'Bob', amountSpent: 10 },
        { name: 'Cathy', amountSpent: 10 },
      ],
    });
    expect(result.totalAmount).toBe(30);
    expect(result.averageAmount).toBe(10);
    expect(result.settlements).toEqual([]);
  });

  it('settles between two people correctly', () => {
    const result = yiqihua({
      individuals: [
        { name: 'Rich', amountSpent: 20 },
        { name: 'Poor', amountSpent: 0 },
      ],
    });
    expect(result.totalAmount).toBe(20);
    expect(result.averageAmount).toBe(10);
    expect(result.settlements).toEqual([
      { from: 'Poor', to: 'Rich', amount: 10 },
    ]);
  });

  it('produces minimal settlements in a typical multi-party case', () => {
    const result = yiqihua({
      individuals: [
        { name: 'A', amountSpent: 70 },
        { name: 'B', amountSpent: 50 },
        { name: 'C', amountSpent: 0 },
        { name: 'D', amountSpent: 0 },
      ],
    });
    // total = 120, avg = 30
    // creditors: A +40, B +20; debtors: C -30, D -30
    expect(result.totalAmount).toBe(120);
    expect(result.averageAmount).toBe(30);
    expect(result.settlements).toEqual([
      { from: 'C', to: 'A', amount: 30 },
      { from: 'D', to: 'A', amount: 10 },
      { from: 'D', to: 'B', amount: 20 },
    ]);
  });

  it('handles floating point values with tolerance', () => {
    const result = yiqihua({
      individuals: [
        { name: 'P1', amountSpent: 0.1 },
        { name: 'P2', amountSpent: 0.2 },
        { name: 'P3', amountSpent: 0.3 },
      ],
    });
    expect(result.totalAmount).toBeCloseTo(0.6, 10);
    expect(result.averageAmount).toBeCloseTo(0.2, 10);
    expect(result.settlements.length).toBe(1);
    const s = result.settlements[0];
    expect(s.from).toBe('P1');
    expect(s.to).toBe('P3');
    expect(s.amount).toBeCloseTo(0.1, 10);
  });

  it('supports decimals = 0 (integer currency)', () => {
    const result = yiqihua({
      decimals: 0,
      individuals: [
        { name: 'A', amountUnits: 1 },
        { name: 'B', amountUnits: 0 },
        { name: 'C', amountUnits: 0 },
      ],
    });
    // total = 1, avg = floor(1/3)=0, remainder=1 -> highest spender A gets +1 share
    // shares: A:1, B:0, C:0; balances all zero -> no settlements
    expect(result.totalAmount).toBe(1);
    expect(result.averageAmount).toBeCloseTo(1/3, 10);
    expect(result.settlements).toEqual([]);
  });

  it('supports decimals = 3 (milli-units)', () => {
    const result = yiqihua({
      decimals: 3,
      individuals: [
        { name: 'X', amountUnits: 1234 },
        { name: 'Y', amountUnits: 0 },
        { name: 'Z', amountUnits: 2 },
      ],
    });
    // total = 1.236, avg = 0.412
    expect(result.totalAmount).toBeCloseTo(1.236, 10);
    expect(result.averageAmount).toBeCloseTo(0.412, 10);
    // sanity: sum of transfers equals sum of debtor deficits
    const totalTransfers = result.settlements.reduce((s, t) => s + t.amount, 0);
    const target = (0.412 - 0) + (0.412 - 0.002);
    expect(totalTransfers).toBeCloseTo(target, 10);
  });

  it('accepts amountUnits or amountSpent but not both per person', () => {
    // amountUnits path
    const r1 = yiqihua({ decimals: 2, individuals: [
      { name: 'U', amountUnits: 100 },
      { name: 'V', amountUnits: 0 },
    ]});
    expect(r1.totalAmount).toBe(1);
    // amountSpent path
    const r2 = yiqihua({ decimals: 2, individuals: [
      { name: 'U', amountSpent: 1 },
      { name: 'V', amountSpent: 0 },
    ]});
    expect(r2.totalAmount).toBe(1);

    // invalid mixed per person should throw
    expect(() => yiqihua({ decimals: 2, individuals: [
      { name: 'X', amountUnits: 100, amountSpent: 1 },
      { name: 'Y', amountUnits: 0 },
    ]})).toThrowError();

    // missing both should throw
    expect(() => yiqihua({ decimals: 2, individuals: [
      { name: 'A' } as any,
      { name: 'B', amountUnits: 0 },
    ]})).toThrowError();
  });
});


