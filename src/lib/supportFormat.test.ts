import { expect, test } from 'vitest';
import { disputeCode, matches, resolutionNote } from './supportFormat';

test('código de disputa estable', () => {
  const id = '3f2a9c10-0000-4000-8000-00000000abcd';
  expect(disputeCode(id)).toMatch(/^DSP-\d{4}$/);
  expect(disputeCode(id)).toBe(disputeCode(id));
});

test('nota de resolución', () => {
  expect(resolutionNote('favor_cliente', '  reembolso total ')).toBe(
    'A favor del cliente: reembolso total',
  );
  expect(resolutionNote('desestimada', '')).toBe('Desestimada');
});

test('búsqueda sin acentos', () => {
  expect(matches('mendez', 'Laura Méndez')).toBe(true);
  expect(matches('xyz', 'Laura', null)).toBe(false);
  expect(matches('  ', 'x')).toBe(true);
});
