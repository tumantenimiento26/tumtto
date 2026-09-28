import { expect, test } from 'vitest';
import {
  filterNotifs,
  groupByDay,
  selectionState,
  unreadByType,
} from './notifList';

const NOW = new Date(2026, 8, 28, 12).getTime();
const today = new Date(2026, 8, 28, 9).toISOString();
const yday = new Date(2026, 8, 27, 20).toISOString();
const items = [
  { id: 'a', type: 'kyc', ts: today, read: false },
  { id: 'b', type: 'kyc', ts: yday, read: true },
  { id: 'c', type: 'disputas', ts: today, read: false },
];

test('filtra por pestaña y tipo', () => {
  expect(filterNotifs(items, 'no-leidas', null).map(n => n.id)).toEqual([
    'a',
    'c',
  ]);
  expect(filterNotifs(items, 'todas', 'kyc').map(n => n.id)).toEqual([
    'a',
    'b',
  ]);
});

test('no leídas por tipo', () => {
  expect(unreadByType(items)).toEqual({ kyc: 1, disputas: 1 });
});

test('agrupa Hoy / Anteriores y omite grupos vacíos', () => {
  const g = groupByDay(items, NOW);
  expect(g.map(x => [x.label, x.items.length])).toEqual([
    ['Hoy', 2],
    ['Anteriores', 1],
  ]);
  expect(groupByDay([items[0]], NOW).map(x => x.label)).toEqual(['Hoy']);
});

test('estado de seleccionar todo', () => {
  expect(selectionState(items, new Set())).toBe('none');
  expect(selectionState(items, new Set(['a']))).toBe('some');
  expect(selectionState(items, new Set(['a', 'b', 'c', 'z']))).toBe('all');
});
