import { expect, test } from 'vitest';
import {
  completedSeries,
  demandHeatmap,
  funnel,
  lastDays,
  prdKpis,
  toCsv,
} from './reportMetrics';

const now = new Date('2026-09-28T12:00:00');
const at = (daysAgo: number, h = 10, m = 0) => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

const orders = [
  {
    id: 'a',
    client_id: 'c1',
    status: 'paid',
    created_at: at(2),
    paid_at: at(1),
  },
  { id: 'b', client_id: 'c1', status: 'cancelled', created_at: at(3) },
  { id: 'c', client_id: 'c2', status: 'completed', created_at: at(4) },
  { id: 'd', client_id: 'c3', status: 'requested', created_at: at(40) },
];
const events = [
  { service_order_id: 'a', to_status: 'accepted', created_at: at(2, 10, 10) },
  { service_order_id: 'c', to_status: 'accepted', created_at: at(4, 11, 0) },
  { service_order_id: 'a', to_status: 'onsite', created_at: at(2, 11) },
];
const techs = [
  { rating_avg: 5, rating_count: 3 },
  { rating_avg: 4, rating_count: 1 },
  { rating_avg: 0, rating_count: 0 },
];

test('KPIs del PRD contra metas', () => {
  const k = prdKpis(orders, events, techs, lastDays(30, now), now);
  const by = Object.fromEntries(k.map(x => [x.key, x]));
  expect(by.cancel.value).toBeCloseTo(1 / 3);
  expect(by.cancel.ok).toBe(false);
  expect(by.rating.value).toBeCloseTo(4.75);
  expect(by.rating.ok).toBe(true);
  expect(by.recurrence.value).toBeCloseTo(1 / 3); // c1 repite de c1,c2,c3
  expect(by.acceptance.value).toBeCloseTo(0.5); // a en 10 min, c en 60 min
});

test('sin datos → null, sin dividir entre cero', () => {
  const k = prdKpis([], [], [], lastDays(7, now), now);
  expect(k.every(x => x.value === null && x.ok === null)).toBe(true);
});

test('embudo y serie diaria', () => {
  const f = funnel(orders, events, lastDays(30, now));
  expect(f.map(s => s.value)).toEqual([3, 2, 1, 2, 1]);
  const s = completedSeries(orders, 7, now);
  expect(s).toHaveLength(7);
  expect(s.reduce((a, x) => a + x.value, 0)).toBe(2);
});

test('mapa de calor por día y franja', () => {
  const g = demandHeatmap(orders, lastDays(30, now));
  expect(g.flat().reduce((a, b) => a + b, 0)).toBe(3);
  expect(g).toHaveLength(7);
  expect(g[0]).toHaveLength(6);
});

test('CSV con escape', () => {
  expect(toCsv([{ a: 'x,y', b: 2 }])).toBe('﻿a,b\n"x,y",2');
});
