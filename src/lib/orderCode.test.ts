import { expect, test } from 'vitest';
import { isOrderCode, orderCode, registerFolios } from './orderCode';

test('código estable de 4 dígitos', () => {
  const c = orderCode('3f2a9c10-1111-4222-8333-444455556666');
  expect(c).toMatch(/^SVC-\d{4}$/);
  expect(orderCode('3f2a9c10-1111-4222-8333-444455556666')).toBe(c);
  expect(orderCode('SVC-2851')).toMatch(/^SVC-\d{4}$/);
  expect(isOrderCode('svc-2851')).toBe(true);
  expect(isOrderCode('María')).toBe(false);
});

test('con folio registrado usa SVC-<folio>; sin folio cae al hash', () => {
  const withFolio = '60000000-0000-4000-8000-000000000001';
  const noFolio = '60000000-0000-4000-8000-000000000002';
  registerFolios([
    { id: withFolio, folio: 1042 },
    { id: noFolio, folio: null },
  ]);
  expect(orderCode(withFolio)).toBe('SVC-1042');
  expect(orderCode(noFolio)).toMatch(/^SVC-\d{4}$/);
  expect(isOrderCode('SVC-1042')).toBe(true);
  expect(isOrderCode('svc 123456')).toBe(false);
  registerFolios([]);
  expect(orderCode(withFolio)).not.toBe('SVC-1042');
});

test('ids con el mismo prefijo dan códigos distintos', () => {
  const ids = Array.from(
    { length: 40 },
    (_, i) => `60000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
  );
  const codes = new Set(ids.map(orderCode));
  expect(codes.size).toBeGreaterThan(35);
});
