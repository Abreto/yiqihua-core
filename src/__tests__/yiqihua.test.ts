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
});


