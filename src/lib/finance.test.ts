import { describe, expect, it } from 'vitest';
import {
  aggregate,
  bucketGoal,
  deltaLabel,
  methodSplit,
  monthlySummary,
  pctDelta,
  periodTotals,
  rangeBuckets,
  type PayLike,
} from './finance';

const now = new Date(2026, 8, 28, 15, 0, 0); // 28 sep 2026, hora local
const at = (d: number, h = 12) => new Date(2026, 8, d, h).toISOString();
const pay = (p: Partial<PayLike>): PayLike => ({
  status: 'paid',
  method: 'card',
  amount_cents: 100_000,
  commission_cents: 15_000,
  paid_at: at(28),
  created_at: at(28),
  ...p,
});

describe('rangeBuckets', () => {
  it('7 días, 30 días y 13 semanas terminando hoy', () => {
    const b7 = rangeBuckets('7d', now);
    expect(b7).toHaveLength(7);
    expect(new Date(b7[6].from).getDate()).toBe(28);
    expect(rangeBuckets('30d', now)).toHaveLength(30);
    const b90 = rangeBuckets('90d', now);
    expect(b90).toHaveLength(13);
    expect(b90[12].to - b90[12].from).toBe(7 * 864e5);
  });
});

describe('aggregate / periodTotals', () => {
  const pays = [
    pay({}),
    pay({ paid_at: at(27), amount_cents: 50_000, commission_cents: 7_500 }),
    pay({ status: 'pending' }),
    pay({ paid_at: at(18), amount_cents: 200_000, commission_cents: 30_000 }), // periodo anterior (7d)
  ];
  it('suma solo pagos cobrados por día', () => {
    const t = aggregate(pays, rangeBuckets('7d', now));
    expect(t[6]).toEqual({ gross: 100_000, commission: 15_000, net: 85_000, count: 1 });
    expect(t[5].gross).toBe(50_000);
  });
  it('periodo actual vs anterior y delta', () => {
    const { cur, prev } = periodTotals(pays, '7d', now);
    expect(cur.gross).toBe(150_000);
    expect(prev.gross).toBe(200_000);
    expect(pctDelta(cur.gross, prev.gross)).toBe(-25);
    expect(deltaLabel(-25)).toBe('−25.0%');
    expect(deltaLabel(pctDelta(10, 0))).toBe('nuevo');
  });
});

describe('methodSplit / monthlySummary / goal', () => {
  it('porcentaje por método', () => {
    const s = methodSplit(
      [pay({ method: 'card', amount_cents: 300 }), pay({ method: 'cash', amount_cents: 100 })],
      0,
      Date.now() + 1e12,
    );
    expect(s).toEqual([
      { method: 'card', amount: 300, pct: 75 },
      { method: 'cash', amount: 100, pct: 25 },
    ]);
  });
  it('6 meses con % de meta', () => {
    const m = monthlySummary([pay({ amount_cents: 25_000_000 })], 50_000_000, now);
    expect(m).toHaveLength(6);
    expect(m[5].gross).toBe(25_000_000);
    expect(m[5].goalPct).toBe(50);
  });
  it('meta por bucket', () => {
    expect(bucketGoal(30_000, '7d')).toBe(1000);
    expect(bucketGoal(30_000, '90d')).toBe(7000);
  });
});
