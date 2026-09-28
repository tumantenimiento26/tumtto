import { expect, test } from 'vitest';
import { addIncluded, categoryStats, rangeLabel } from './catalogStats';

const data = {
  techCategories: [
    { technician_id: 't1', category_id: 'c1' },
    { technician_id: 't2', category_id: 'c1' },
    { technician_id: 't1', category_id: 'c2' },
  ],
  rates: [
    { category_id: 'c1', visita_cents: 30000 },
    { category_id: 'c1', visita_cents: 250000 },
    { category_id: 'c1', visita_cents: 0 },
  ],
  orders: [{ category_id: 'c1' }, { category_id: 'c1' }, { category_id: null }],
};

test('técnicos, órdenes y rango por categoría', () => {
  expect(categoryStats('c1', data)).toEqual({
    technicians: 2,
    orders: 2,
    minCents: 30000,
    maxCents: 250000,
  });
  expect(categoryStats('c2', data)).toMatchObject({
    technicians: 1,
    minCents: null,
  });
});

test('etiqueta de rango', () => {
  expect(rangeLabel({ minCents: 30000, maxCents: 250000 })).toBe(
    '$300 – $2,500',
  );
  expect(rangeLabel({ minCents: 45000, maxCents: 45000 })).toBe('$450');
  expect(rangeLabel({ minCents: null, maxCents: null })).toBe('Sin tarifas');
});

test('servicios incluidos sin duplicados', () => {
  expect(addIncluded(['Fugas'], '  fugas ')).toEqual(['Fugas']);
  expect(addIncluded(['Fugas'], 'Boiler  nuevo')).toEqual([
    'Fugas',
    'Boiler nuevo',
  ]);
  expect(addIncluded(['Fugas'], '   ')).toEqual(['Fugas']);
});
