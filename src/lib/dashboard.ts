// Lógica pura del dashboard de la consola (docs/design-handoff-web, C ·
// Dashboard): periodos, series, promedio/máximo, trazos SVG, pipeline y
// actividad. Sin React ni store para poder probarla con vitest.

import { orderCode } from './orderCode';

export type DashRange = 'hoy' | '7d' | '30d';
export type DashMetric = 'gmv' | 'servicios' | 'ticket';

export interface Bucket {
  start: number;
  end: number;
  label: string;
}

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const DOW = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

const startOfDay = (t: number) => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/** Duración total del periodo (para el periodo anterior). */
export function rangeMs(range: DashRange): number {
  return range === 'hoy' ? DAY : range === '7d' ? 7 * DAY : 30 * DAY;
}

/**
 * Cubetas del periodo: hoy = 12 franjas de 2 h desde las 00:00; 7d = 7 días;
 * 30d = 30 días, terminando en el día actual.
 */
export function buckets(range: DashRange, now = Date.now()): Bucket[] {
  const today = startOfDay(now);
  if (range === 'hoy')
    return Array.from({ length: 12 }, (_, i) => {
      const start = today + i * 2 * HOUR;
      return {
        start,
        end: start + 2 * HOUR,
        label: `${String(i * 2).padStart(2, '0')}h`,
      };
    });
  const n = range === '7d' ? 7 : 30;
  return Array.from({ length: n }, (_, i) => {
    const start = today - (n - 1 - i) * DAY;
    const d = new Date(start);
    return {
      start,
      end: start + DAY,
      label: range === '7d' ? DOW[d.getDay()] : String(d.getDate()),
    };
  });
}

/** Mismas cubetas desplazadas hacia atrás (periodo anterior). */
export const shiftBuckets = (bks: Bucket[], ms: number): Bucket[] =>
  bks.map(b => ({ ...b, start: b.start - ms, end: b.end - ms }));

const inBucket = (iso: string | null | undefined, b: Bucket) => {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return t >= b.start && t < b.end;
};

export interface OrderLike {
  id: string;
  status: string;
  created_at: string;
  updated_at: string;
  category_id: string;
  client_id: string;
  technician_id: string | null;
  quoted_total_cents: number | null;
}
export interface PaymentLike {
  status: string;
  paid_at: string | null;
  amount_cents: number;
}

/** Serie por cubeta: GMV en pesos, servicios creados o ticket medio. */
export function series(
  metric: DashMetric,
  bks: Bucket[],
  orders: OrderLike[],
  payments: PaymentLike[],
): number[] {
  const paid = payments.filter(p => p.status === 'paid');
  return bks.map(b => {
    const ps = paid.filter(p => inBucket(p.paid_at, b));
    const gmv = ps.reduce((s, p) => s + p.amount_cents, 0) / 100;
    if (metric === 'gmv') return Math.round(gmv);
    if (metric === 'servicios')
      return orders.filter(o => inBucket(o.created_at, b)).length;
    return ps.length ? Math.round(gmv / ps.length) : 0;
  });
}

export const sum = (v: number[]) => v.reduce((s, x) => s + x, 0);

export const average = (v: number[]) => (v.length ? sum(v) / v.length : 0);

/** Índice del máximo (el primero si hay empate); -1 si todo es 0. */
export function peakIndex(v: number[]): number {
  let best = -1;
  let max = 0;
  v.forEach((x, i) => {
    if (x > max) {
      max = x;
      best = i;
    }
  });
  return best;
}

/** Variación porcentual; null si el periodo anterior es 0. */
export function deltaPct(cur: number, prev: number): number | null {
  if (!prev) return null;
  return ((cur - prev) / prev) * 100;
}

/** Máximo "redondo" (1/2/2.5/5 × 10ⁿ) para el eje Y. */
export function niceMax(v: number): number {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 2, 2.5, 5, 10]) if (v <= m * p) return m * p;
  return 10 * p;
}

/** Trazo de línea + área en un viewBox w×h, con `max` como tope del eje. */
export function linePaths(
  values: number[],
  max: number,
  w = 600,
  h = 200,
): { line: string; area: string; points: [number, number][] } {
  if (!values.length) return { line: '', area: '', points: [] };
  const step = values.length > 1 ? w / (values.length - 1) : 0;
  const points = values.map(
    (v, i) =>
      [
        +(values.length > 1 ? i * step : w / 2).toFixed(2),
        +(h - (Math.min(v, max) / (max || 1)) * h).toFixed(2),
      ] as [number, number],
  );
  const line = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
  const area = `${line} L${points[points.length - 1][0]} ${h} L${points[0][0]} ${h} Z`;
  return { line, area, points };
}

/** Sparkline 100×32 (con margen para que el trazo no se corte). */
export function sparkPaths(values: number[]): {
  line: string;
  area: string;
  endY: number;
} {
  const v = values.length ? values : [0, 0];
  const max = Math.max(...v);
  const min = Math.min(...v);
  const span = max - min || 1;
  const pts = v.map((x, i) => [
    v.length > 1 ? (i / (v.length - 1)) * 100 : 50,
    +(28 - ((x - min) / span) * 24).toFixed(2),
  ]);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');
  return {
    line,
    area: `${line} L100 32 L0 32 Z`,
    endY: pts[pts.length - 1][1],
  };
}

/** Saludo según la hora (mismo corte que el prototipo). */
export function greeting(d: Date): string {
  const h = d.getHours();
  return h < 6
    ? 'Buenas noches'
    : h < 12
      ? 'Buenos días'
      : h < 19
        ? 'Buenas tardes'
        : 'Buenas noches';
}

/** "LUNES 28 DE SEP · 02:25". */
export function clockLabel(d: Date): string {
  const day = d.toLocaleDateString('es-MX', { weekday: 'long' });
  const month = d
    .toLocaleDateString('es-MX', { month: 'short' })
    .replace('.', '');
  const time = d.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${day} ${d.getDate()} de ${month} · ${time}`.toUpperCase();
}

/* ── Pipeline (donut) ─────────────────────────────────────────────────── */

export type PipelineKey = 'buscando' | 'curso' | 'cobro' | 'cerrados';

export const PIPELINE: {
  key: PipelineKey;
  label: string;
  statuses: string[];
  color: string;
}[] = [
  {
    key: 'buscando',
    label: 'Buscando técnico',
    statuses: ['requested'],
    color: '#F59E0B',
  },
  {
    key: 'curso',
    label: 'En curso',
    statuses: ['accepted', 'enroute', 'onsite', 'quote', 'working'],
    color: '#0A6BCF',
  },
  {
    key: 'cobro',
    label: 'Por cobrar',
    statuses: ['closing', 'completed'],
    color: '#18C1FF',
  },
  {
    key: 'cerrados',
    label: 'Pagados',
    statuses: ['paid', 'closed'],
    color: '#1E6B4B',
  },
];

export function pipeline(orders: { status: string }[]) {
  return PIPELINE.map(p => ({
    ...p,
    value: orders.filter(o => p.statuses.includes(o.status)).length,
  }));
}

/**
 * Arcos de un donut dibujado con <circle> y stroke-dasharray: cada segmento
 * es `{ dash: "largo resto", offset }` sobre la circunferencia de radio r.
 */
export function donutArcs(
  values: number[],
  r: number,
  gap = 2,
): { dash: string; offset: number }[] {
  const c = 2 * Math.PI * r;
  const total = sum(values);
  let acc = 0;
  return values.map(v => {
    const len = total ? (v / total) * c : 0;
    const seg = Math.max(0, len - (len > gap ? gap : 0));
    const out = {
      dash: `${seg.toFixed(2)} ${(c - seg).toFixed(2)}`,
      offset: +(-acc).toFixed(2),
    };
    acc += len;
    return out;
  });
}

/* ── Actividad en vivo ────────────────────────────────────────────────── */

export interface EventLike {
  id: string;
  service_order_id: string;
  to_status: string;
  created_at: string;
}

export interface ActivityItem {
  id: string;
  status: string;
  text: string;
  ts: string;
  href: string;
}

const VERB: Record<string, (who: string, code: string, cat: string) => string> =
  {
    requested: (_w, code, cat) => `Nueva solicitud de ${cat} · ${code}`,
    accepted: (w, code) => `${w} aceptó ${code}`,
    enroute: (w, code) => `${w} va en camino · ${code}`,
    onsite: (w, code) => `${w} llegó al domicilio · ${code}`,
    quote: (w, code) => `${w} envió cotización · ${code}`,
    working: (w, code) => `${w} empezó el trabajo · ${code}`,
    closing: (_w, code) => `${code} listo para cobro`,
    completed: (_w, code) => `${code} completado`,
    paid: (_w, code) => `Pago recibido · ${code}`,
    closed: (_w, code) => `${code} cerrado`,
    cancelled: (_w, code) => `${code} cancelado`,
    expired: (_w, code) => `${code} expiró sin técnico`,
  };

/** Últimos eventos de estado, legibles (más nuevos primero). */
export function activity(
  events: EventLike[],
  orders: OrderLike[],
  lookup: { name: (id: string | null) => string; cat: (id: string) => string },
  limit = 6,
): ActivityItem[] {
  const byId = new Map(orders.map(o => [o.id, o]));
  return [...events]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit)
    .map(e => {
      const o = byId.get(e.service_order_id);
      const code = orderCode(e.service_order_id);
      const fn = VERB[e.to_status];
      const who = lookup.name(o?.technician_id ?? null);
      return {
        id: e.id,
        status: e.to_status,
        text: fn
          ? fn(who, code, o ? lookup.cat(o.category_id) : 'servicio')
          : `${code}: ${e.to_status}`,
        ts: e.created_at,
        href: `/servicios/${e.service_order_id}`,
      };
    });
}

/** Servicios del periodo por categoría, de mayor a menor. */
export function categoryCounts(
  orders: OrderLike[],
  categories: { id: string; name: string; slug?: string }[],
) {
  const total = orders.length;
  return categories
    .map(c => {
      const value = orders.filter(o => o.category_id === c.id).length;
      return {
        id: c.id,
        slug: c.slug ?? '',
        label: c.name,
        value,
        pct: total ? Math.round((value / total) * 100) : 0,
      };
    })
    .filter(c => c.value > 0)
    .sort((a, b) => b.value - a.value);
}

/** Órdenes creadas hoy vs ayer a la misma hora (para el KPI de activos). */
export function sameTimeYesterdayDelta(
  orders: { created_at: string }[],
  now = Date.now(),
): number {
  const today = startOfDay(now);
  const elapsed = now - today;
  const count = (from: number, to: number) =>
    orders.filter(o => {
      const t = new Date(o.created_at).getTime();
      return t >= from && t < to;
    }).length;
  return count(today, now) - count(today - DAY, today - DAY + elapsed);
}

/** Calificación media ponderada por número de reseñas. */
export function weightedRating(
  techs: { rating_avg: number; rating_count: number }[],
): { avg: number; count: number } {
  const count = sum(techs.map(t => t.rating_count));
  if (!count) return { avg: 0, count: 0 };
  return {
    avg: sum(techs.map(t => t.rating_avg * t.rating_count)) / count,
    count,
  };
}
