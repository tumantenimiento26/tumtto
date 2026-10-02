// fetchAllRows: PostgREST corta cada consulta en 1,000 filas; el snapshot
// debe seguir pidiendo páginas hasta recibir una corta.
import { expect, it, vi } from 'vitest';
import { PAGE_SIZE, fetchAllRows } from './store';

const rows = (n: number) => Array.from({ length: n }, (_, i) => ({ id: i }));

it('encadena páginas hasta la última (corta)', async () => {
  const all = rows(PAGE_SIZE * 2 + 300);
  const page = vi.fn(async (from: number, to: number) => ({
    data: all.slice(from, to + 1),
    error: null,
  }));
  const got = await fetchAllRows<{ id: number }>(page);
  expect(got).toHaveLength(all.length);
  expect(got.at(-1)?.id).toBe(all.length - 1);
  expect(page).toHaveBeenCalledTimes(3);
  expect(page).toHaveBeenNthCalledWith(2, PAGE_SIZE, PAGE_SIZE * 2 - 1);
});

it('una página exacta de 1,000 pide una más (vacía) y termina', async () => {
  const all = rows(PAGE_SIZE);
  const page = vi.fn(async (from: number, to: number) => ({
    data: all.slice(from, to + 1),
    error: null,
  }));
  expect(await fetchAllRows(page)).toHaveLength(PAGE_SIZE);
  expect(page).toHaveBeenCalledTimes(2);
});

it('propaga el error de PostgREST', async () => {
  await expect(
    fetchAllRows(async () => ({ data: null, error: new Error('rls') })),
  ).rejects.toThrow('rls');
});
