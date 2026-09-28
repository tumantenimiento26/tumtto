import { expect, test } from 'vitest';
import { isOrderCode, orderCode } from './orderCode';

test('código estable de 4 dígitos', () => {
  const c = orderCode('3f2a9c10-1111-4222-8333-444455556666');
  expect(c).toMatch(/^SVC-\d{4}$/);
  expect(orderCode('3f2a9c10-1111-4222-8333-444455556666')).toBe(c);
  expect(orderCode('SVC-2851')).toMatch(/^SVC-\d{4}$/);
  expect(isOrderCode('svc-2851')).toBe(true);
  expect(isOrderCode('María')).toBe(false);
});

test('ids con el mismo prefijo dan códigos distintos', () => {
  const ids = Array.from(
    { length: 40 },
    (_, i) => `60000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
  );
  const codes = new Set(ids.map(orderCode));
  expect(codes.size).toBeGreaterThan(35);
});
