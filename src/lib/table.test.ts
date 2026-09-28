import { expect, test } from 'vitest';
import { pageWindow, sortRows, type DataColumn } from './table';

type R = { id: string; n: number | null; s: string };
const cols: DataColumn<R>[] = [
  { key: 'n', header: 'N', render: r => r.n, sortValue: r => r.n },
  { key: 's', header: 'S', render: r => r.s, sortValue: r => r.s },
];
const rows: R[] = [
  { id: 'a', n: 3, s: 'Ñoño' },
  { id: 'b', n: null, s: 'árbol' },
  { id: 'c', n: 1, s: 'Zeta' },
];

test('ordena números con nulos al final y texto en español', () => {
  expect(sortRows(rows, cols, { key: 'n', dir: 'asc' }).map(r => r.id)).toEqual(
    ['c', 'a', 'b'],
  );
  expect(
    sortRows(rows, cols, { key: 'n', dir: 'desc' }).map(r => r.id)[0],
  ).toBe('b');
  expect(sortRows(rows, cols, { key: 's', dir: 'asc' }).map(r => r.id)).toEqual(
    ['b', 'a', 'c'],
  );
  expect(sortRows(rows, cols, null)).toBe(rows);
});

test('ventana de paginación', () => {
  expect(pageWindow(0, 3)).toEqual([0, 1, 2]);
  expect(pageWindow(9, 10)).toEqual([5, 6, 7, 8, 9]);
  expect(pageWindow(4, 10)).toEqual([2, 3, 4, 5, 6]);
});
