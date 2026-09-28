import { expect, it } from 'vitest';
import { isValidClabe } from './clabe';

it('valida el dígito de control de la CLABE', () => {
  expect(isValidClabe('032180000118359719')).toBe(true);
  expect(isValidClabe('032180000118359718')).toBe(false); // control alterado
  expect(isValidClabe('032180000118359')).toBe(false); // corta
  expect(isValidClabe('03218000011835971a')).toBe(false);
});
