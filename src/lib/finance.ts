// Agregados de Finanzas (puros, en centavos), probados en finance.test.ts.

export type FinRange = '7d' | '30d' | '90d';

export interface PayLike {
  status: string;
  method: string;
  amount_cents: number;
  commission_cents: number;
  paid_at: string | null;
  created_at: string;
}

export interface Bucket {
  from: number;
  to: number;
  label: string;
}

const DAY = 864e5;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** 7d → 7 días · 30d → 30 días · 90d → 13 semanas. Último bucket = hoy. */
export function rangeBuckets(range: FinRange, now = new Date()): Bucket[] {
  const today = startOfDay(now).getTime();
  if (range === '90d') {
    return Array.from({ length: 13 }, (_, i) => {
      const to = today + DAY - (12 - i) * 7 * DAY;
      const from = to - 7 * DAY;
      return {
        from,
        to,
        label: new Date(from).toLocaleDateString('es-MX', {
          day: '2-digit',
          month: 'short',
        }),
      };
    });
  }
  const n = range === '7d' ? 7 : 30;
  return Array.from({ length: n }, (_, i) => {
    const from = today - (n - 1 - i) * DAY;
    const d = new Date(from);
    return {
      from,
      to: from + DAY,
      label:
        range === '7d'
          ? d.toLocaleDateString('es-MX', { weekday: 'short' }).replace('.', '')
          : String(d.getDate()),
    };
  });
}

/** Momento que cuenta para el periodo: cobro si existe, si no creación. */
const when = (p: PayLike) => new Date(p.paid_at ?? p.created_at).getTime();

export interface BucketTotals {
  gross: number;
  commission: number;
  net: number;
  count: number;
}

/** Suma pagos cobrados (status 'paid') por bucket. */
export function aggregate(payments: PayLike[], buckets: Bucket[]): BucketTotals[] {
  return buckets.map(b => {
    const ps = payments.filter(p => {
      if (p.status !== 'paid') return false;
      const t = when(p);
      return t >= b.from && t < b.to;
    });
    const gross = ps.reduce((s, p) => s + p.amount_cents, 0);
    const commission = ps.reduce((s, p) => s + p.commission_cents, 0);
    return { gross, commission, net: gross - commission, count: ps.length };
  });
}

/** Totales del periodo actual y del anterior (misma duración). */
export function periodTotals(
  payments: PayLike[],
  range: FinRange,
  now = new Date(),
): { cur: BucketTotals; prev: BucketTotals } {
  const b = rangeBuckets(range, now);
  const from = b[0].from;
  const to = b[b.length - 1].to;
  const len = to - from;
  const [cur] = aggregate(payments, [{ from, to, label: '' }]);
  const [prev] = aggregate(payments, [{ from: from - len, to: from, label: '' }]);
  return { cur, prev };
}

/** Variación % (null si no hay base). */
export function pctDelta(cur: number, prev: number): number | null {
  if (!prev) return cur ? null : 0;
  return Math.round(((cur - prev) / prev) * 1000) / 10;
}

export const deltaLabel = (d: number | null) =>
  d == null ? 'nuevo' : `${d > 0 ? '+' : d < 0 ? '−' : ''}${Math.abs(d).toFixed(1)}%`;

/** Desglose por método de los pagos cobrados en [from, to). */
export function methodSplit(
  payments: PayLike[],
  from: number,
  to: number,
): { method: string; amount: number; pct: number }[] {
  const acc: Record<string, number> = {};
  for (const p of payments) {
    if (p.status !== 'paid') continue;
    const t = when(p);
    if (t < from || t >= to) continue;
    acc[p.method] = (acc[p.method] ?? 0) + p.amount_cents;
  }
  const total = Object.values(acc).reduce((s, v) => s + v, 0);
  return Object.entries(acc)
    .map(([method, amount]) => ({
      method,
      amount,
      pct: total ? Math.round((amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/** Últimos `months` meses (antiguo → actual) con GMV, comisión, servicios y % de meta. */
export function monthlySummary(
  payments: PayLike[],
  goalCents: number,
  now = new Date(),
  months = 6,
) {
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const [t] = aggregate(payments, [
      { from: d.getTime(), to: next.getTime(), label: '' },
    ]);
    return {
      label: d.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' }),
      ...t,
      goalPct: goalCents ? Math.round((t.gross / goalCents) * 100) : 0,
    };
  });
}

/** Meta por bucket a partir de la meta mensual (bucket semanal = 7 días). */
export const bucketGoal = (monthlyGoalCents: number, range: FinRange) =>
  Math.round((monthlyGoalCents / 30) * (range === '90d' ? 7 : 1));
