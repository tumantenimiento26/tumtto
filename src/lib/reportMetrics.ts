// Métricas de Reportes derivadas del snapshot (puro, probado). Las RPC
// admin_report_* dan GMV/ticket/zonas; lo demás sale de órdenes y eventos.

type Order = {
  id: string;
  client_id: string;
  status: string;
  created_at: string;
  paid_at?: string | null;
};
type Event = {
  service_order_id: string;
  to_status: string;
  created_at: string;
};
type Tech = { rating_avg: number; rating_count: number };

import { fmtDate, mxParts } from '@/lib/dates';

export type Period = { from: Date; to: Date };

const DAY = 86_400_000;
const DONE = ['completed', 'paid', 'closed'];
const PAID = ['paid', 'closed'];

export function lastDays(n: number, now = new Date()): Period {
  const to = new Date(now);
  return { from: new Date(to.getTime() - n * DAY), to };
}

const inPeriod = (iso: string | null | undefined, p: Period) => {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return t >= p.from.getTime() && t < p.to.getTime();
};

export type Kpi = {
  key: 'cancel' | 'rating' | 'recurrence' | 'acceptance';
  label: string;
  value: number | null; // null = sin datos en el periodo
  display: string;
  goal: string;
  ok: boolean | null;
  /** 0..1 para la barra (proporción respecto a la meta o escala natural). */
  bar: number;
};

const pct = (v: number) => `${Math.round(v * 1000) / 10}%`;

/** KPIs contra las metas del PRD a 6 meses. */
export function prdKpis(
  orders: Order[],
  events: Event[],
  techs: Tech[],
  p: Period,
  now = new Date(),
): Kpi[] {
  const inRange = orders.filter(o => inPeriod(o.created_at, p));

  // Cancelación: canceladas / creadas en el periodo (meta ≤ 12 %).
  const cancel = inRange.length
    ? inRange.filter(o => o.status === 'cancelled').length / inRange.length
    : null;

  // Calificación media ponderada por número de reseñas (meta ≥ 4.3).
  const rated = techs.filter(t => t.rating_count > 0);
  const n = rated.reduce((s, t) => s + t.rating_count, 0);
  const rating = n
    ? rated.reduce((s, t) => s + t.rating_avg * t.rating_count, 0) / n
    : null;

  // Recurrencia a 90 días: clientes con ≥2 órdenes / clientes con ≥1 (meta 25 %).
  const w90 = lastDays(90, now);
  const perClient = new Map<string, number>();
  for (const o of orders)
    if (inPeriod(o.created_at, w90))
      perClient.set(o.client_id, (perClient.get(o.client_id) ?? 0) + 1);
  const recurrence = perClient.size
    ? [...perClient.values()].filter(c => c >= 2).length / perClient.size
    : null;

  // Aceptación en < 30 min: aceptadas a tiempo / aceptadas (meta 90 %).
  const acceptedAt = new Map<string, number>();
  for (const e of events)
    if (e.to_status === 'accepted' && !acceptedAt.has(e.service_order_id))
      acceptedAt.set(e.service_order_id, new Date(e.created_at).getTime());
  const accepted = inRange.filter(o => acceptedAt.has(o.id));
  const acceptance = accepted.length
    ? accepted.filter(
        o =>
          acceptedAt.get(o.id)! - new Date(o.created_at).getTime() <=
          30 * 60_000,
      ).length / accepted.length
    : null;

  return [
    {
      key: 'cancel',
      label: 'Tasa de cancelación',
      value: cancel,
      display: cancel == null ? '—' : pct(cancel),
      goal: 'Meta ≤ 12%',
      ok: cancel == null ? null : cancel <= 0.12,
      // Barra: cuánto margen queda bajo el tope (llena = 0 %).
      bar: cancel == null ? 0 : Math.max(0, 1 - cancel / 0.24),
    },
    {
      key: 'rating',
      label: 'Calificación media',
      value: rating,
      display: rating == null ? '—' : rating.toFixed(1),
      goal: 'Meta ≥ 4.3',
      ok: rating == null ? null : rating >= 4.3,
      bar: rating == null ? 0 : rating / 5,
    },
    {
      key: 'recurrence',
      label: 'Recurrencia a 90 días',
      value: recurrence,
      display: recurrence == null ? '—' : pct(recurrence),
      goal: 'Meta 25%',
      ok: recurrence == null ? null : recurrence >= 0.25,
      bar: recurrence == null ? 0 : Math.min(1, recurrence / 0.25),
    },
    {
      key: 'acceptance',
      label: 'Aceptación en < 30 min',
      value: acceptance,
      display: acceptance == null ? '—' : pct(acceptance),
      goal: 'Meta 90%',
      ok: acceptance == null ? null : acceptance >= 0.9,
      bar: acceptance ?? 0,
    },
  ];
}

/** Servicios completados por día en el periodo y en el periodo anterior. */
export function completedSeries(
  orders: Order[],
  days: number,
  now = new Date(),
): { label: string; value: number; prev: number }[] {
  const end = new Date(now);
  end.setHours(0, 0, 0, 0);
  const doneDay = (o: Order) =>
    DONE.includes(o.status) ? (o.paid_at ?? o.created_at) : null;
  const count = (dayStart: number) =>
    orders.filter(o => {
      const d = doneDay(o);
      if (!d) return false;
      const t = new Date(d).getTime();
      return t >= dayStart && t < dayStart + DAY;
    }).length;
  const out: { label: string; value: number; prev: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const start = end.getTime() - i * DAY;
    const label = fmtDate(start, { day: '2-digit', month: 'short' });
    out.push({ label, value: count(start), prev: count(start - days * DAY) });
  }
  return out;
}

/** Embudo: solicitadas → aceptadas → en sitio → completadas → pagadas. */
export function funnel(orders: Order[], events: Event[], p: Period) {
  const reached = (status: string) => {
    const ids = new Set(
      events.filter(e => e.to_status === status).map(e => e.service_order_id),
    );
    return ids;
  };
  const inRange = orders.filter(o => inPeriod(o.created_at, p));
  const acc = reached('accepted');
  const ons = reached('onsite');
  const steps = [
    { label: 'Solicitadas', value: inRange.length },
    { label: 'Aceptadas', value: inRange.filter(o => acc.has(o.id)).length },
    { label: 'En sitio', value: inRange.filter(o => ons.has(o.id)).length },
    {
      label: 'Completadas',
      value: inRange.filter(o => DONE.includes(o.status)).length,
    },
    {
      label: 'Pagadas',
      value: inRange.filter(o => PAID.includes(o.status)).length,
    },
  ];
  return steps.map((s, i) => ({
    ...s,
    ofTotal: steps[0].value ? s.value / steps[0].value : 0,
    ofPrev: i === 0 || !steps[i - 1].value ? 1 : s.value / steps[i - 1].value,
  }));
}

export const HEAT_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
export const HEAT_SLOTS = ['8–10', '10–12', '12–14', '14–16', '16–18', '18–20'];

/** Solicitudes por día (Lun..Dom) × franja de 2 h (8–20 h), hora de la ZMG. */
export function demandHeatmap(orders: Order[], p: Period): number[][] {
  const grid = HEAT_DAYS.map(() => HEAT_SLOTS.map(() => 0));
  for (const o of orders) {
    if (!inPeriod(o.created_at, p)) continue;
    const { hour, dow } = mxParts(o.created_at);
    const slot = Math.floor((hour - 8) / 2);
    if (slot < 0 || slot >= HEAT_SLOTS.length) continue;
    const day = (dow + 6) % 7; // 0 = lunes
    grid[day][slot] += 1;
  }
  return grid;
}

/** CSV simple (comillas escapadas, separador coma, BOM para Excel). */
export function toCsv(rows: Record<string, string | number>[]): string {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return (
    '﻿' +
    [
      cols.join(','),
      ...rows.map(r => cols.map(c => esc(r[c] ?? '')).join(',')),
    ].join('\n')
  );
}
