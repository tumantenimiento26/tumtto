import { describe, expect, test } from 'vitest';
import {
  activity,
  average,
  buckets,
  categoryCounts,
  deltaPct,
  donutArcs,
  greeting,
  linePaths,
  niceMax,
  peakIndex,
  pipeline,
  rangeMs,
  sameTimeYesterdayDelta,
  series,
  shiftBuckets,
  sparkPaths,
  weightedRating,
} from './dashboard';

const NOW = new Date(2026, 8, 28, 14, 30).getTime(); // lun 28 sep 14:30
const iso = (d: number, h = 10) =>
  new Date(2026, 8, 28 - d, h, 0).toISOString();

const order = (id: string, created: string, extra = {}) => ({
  id,
  status: 'requested',
  created_at: created,
  updated_at: created,
  category_id: 'cat-a',
  client_id: 'c1',
  technician_id: 't1',
  quoted_total_cents: null,
  ...extra,
});

describe('periodos', () => {
  test('cubetas por rango', () => {
    const h = buckets('hoy', NOW);
    expect(h).toHaveLength(12);
    expect(h[0].label).toBe('00h');
    const w = buckets('7d', NOW);
    expect(w).toHaveLength(7);
    expect(w[6].label).toBe('lun');
    expect(buckets('30d', NOW)).toHaveLength(30);
    const prev = shiftBuckets(w, rangeMs('7d'));
    expect(w[0].start - prev[0].start).toBe(7 * 86_400_000);
  });

  test('series de GMV, servicios y ticket medio', () => {
    const bks = buckets('7d', NOW);
    const orders = [order('a', iso(0)), order('b', iso(0)), order('c', iso(2))];
    const pays = [
      { status: 'paid', paid_at: iso(0), amount_cents: 100_000 },
      { status: 'paid', paid_at: iso(0), amount_cents: 50_000 },
      { status: 'failed', paid_at: iso(0), amount_cents: 999_999 },
    ];
    expect(series('gmv', bks, orders, pays)[6]).toBe(1500);
    expect(series('servicios', bks, orders, pays)[6]).toBe(2);
    expect(series('servicios', bks, orders, pays)[4]).toBe(1);
    expect(series('ticket', bks, orders, pays)[6]).toBe(750);
    expect(series('ticket', bks, orders, pays)[0]).toBe(0);
  });
});

describe('estadística y trazos', () => {
  test('promedio, máximo y variación', () => {
    expect(average([2, 4, 6])).toBe(4);
    expect(peakIndex([1, 5, 5, 2])).toBe(1);
    expect(peakIndex([0, 0])).toBe(-1);
    expect(deltaPct(150, 100)).toBe(50);
    expect(deltaPct(10, 0)).toBeNull();
  });

  test('eje Y redondo', () => {
    expect(niceMax(0)).toBe(1);
    expect(niceMax(68_027)).toBe(100_000);
    expect(niceMax(1_800)).toBe(2_000);
    expect(niceMax(230)).toBe(250);
  });

  test('línea y sparkline', () => {
    const { line, points } = linePaths([0, 50, 100], 100);
    expect(line.startsWith('M0 200')).toBe(true);
    expect(points[2]).toEqual([600, 0]);
    const s = sparkPaths([1, 2, 3]);
    expect(s.endY).toBe(4);
    expect(s.area.endsWith('Z')).toBe(true);
    expect(sparkPaths([]).line).toContain('M0');
  });
});

describe('pipeline, actividad y categorías', () => {
  test('pipeline agrupa estados', () => {
    const p = pipeline([
      { status: 'requested' },
      { status: 'enroute' },
      { status: 'working' },
      { status: 'paid' },
      { status: 'cancelled' },
    ]);
    expect(p.map(x => x.value)).toEqual([1, 2, 0, 1]);
  });

  test('arcos del donut suman la circunferencia', () => {
    const arcs = donutArcs([1, 1], 70, 0);
    const c = 2 * Math.PI * 70;
    expect(+arcs[0].dash.split(' ')[0]).toBeCloseTo(c / 2, 1);
    expect(arcs[1].offset).toBeCloseTo(-c / 2, 1);
  });

  test('actividad legible, más nueva primero', () => {
    const orders = [order('00000000-aaaa', iso(0))];
    const items = activity(
      [
        {
          id: 'e1',
          service_order_id: '00000000-aaaa',
          to_status: 'requested',
          created_at: iso(0, 9),
        },
        {
          id: 'e2',
          service_order_id: '00000000-aaaa',
          to_status: 'accepted',
          created_at: iso(0, 11),
        },
      ],
      orders,
      { name: () => 'Ramón', cat: () => 'Plomería' },
    );
    expect(items[0].text).toMatch(/^Ramón aceptó SVC-\d{4}$/);
    expect(items[1].text).toContain('Plomería');
    expect(items[0].href).toBe('/servicios/00000000-aaaa');
  });

  test('categorías con conteo y porcentaje', () => {
    const c = categoryCounts(
      [order('a', iso(0)), order('b', iso(0), { category_id: 'cat-b' })],
      [
        { id: 'cat-a', name: 'Plomería' },
        { id: 'cat-b', name: 'Gas' },
        { id: 'cat-c', name: 'Cerrajería' },
      ],
    );
    expect(c.map(x => [x.label, x.pct])).toEqual([
      ['Plomería', 50],
      ['Gas', 50],
    ]);
  });
});

describe('KPIs', () => {
  test('vs ayer a esta hora', () => {
    const orders = [
      { created_at: new Date(2026, 8, 28, 9).toISOString() },
      { created_at: new Date(2026, 8, 28, 13).toISOString() },
      { created_at: new Date(2026, 8, 27, 8).toISOString() },
      { created_at: new Date(2026, 8, 27, 20).toISOString() }, // después de esta hora
    ];
    expect(sameTimeYesterdayDelta(orders, NOW)).toBe(1);
  });

  test('calificación ponderada y saludo', () => {
    expect(
      weightedRating([
        { rating_avg: 5, rating_count: 3 },
        { rating_avg: 4, rating_count: 1 },
      ]).avg,
    ).toBe(4.75);
    expect(weightedRating([]).count).toBe(0);
    expect(greeting(new Date(2026, 0, 1, 9))).toBe('Buenos días');
    expect(greeting(new Date(2026, 0, 1, 15))).toBe('Buenas tardes');
    expect(greeting(new Date(2026, 0, 1, 2))).toBe('Buenas noches');
  });
});

describe('buckets con rango libre', () => {
  test('1 día por franjas, ≤31 por día, más por semana', () => {
    const d = (m: number, day: number) => new Date(2026, m, day);
    expect(buckets({ from: d(8, 3), to: d(8, 3) })).toHaveLength(12);
    expect(buckets({ from: d(8, 1), to: d(8, 10) })).toHaveLength(10);
    const w = buckets({ from: d(6, 1), to: d(8, 30) });
    expect(w[0].end - w[0].start).toBe(7 * 864e5);
    expect(rangeMs({ from: d(8, 1), to: d(8, 10) })).toBe(10 * 864e5);
  });
});
