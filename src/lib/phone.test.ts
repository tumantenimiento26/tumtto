import { expect, test } from 'vitest';
import {
  COUNTRIES,
  formatNational,
  formatPhone,
  isValidPhone,
  parsePhone,
  toE164,
} from './phone';

const mx = COUNTRIES[0];
const us = COUNTRIES.find(c => c.iso === 'US')!;
const gt = COUNTRIES.find(c => c.iso === 'GT')!;

test('aplica máscara al teclear y corta el excedente', () => {
  expect(formatNational('331', mx)).toBe('33 1');
  expect(formatNational('331234567899', mx)).toBe('33 1234 5678');
  expect(formatNational('5551234567', us)).toBe('(555) 123-4567');
});

test('E.164 ida y vuelta', () => {
  expect(toE164('33 1234 5678', mx)).toBe('+523312345678');
  expect(parsePhone('+50212345678')).toEqual({
    country: gt,
    national: '12345678',
  });
  expect(parsePhone('3312345678').country).toBe(mx);
});

test('valida longitud por país', () => {
  expect(isValidPhone('+523312345678')).toBe(true);
  expect(isValidPhone('+52331234567')).toBe(false);
  expect(isValidPhone('+50212345678')).toBe(true);
  expect(isValidPhone('3312345678')).toBe(false);
});

test('formatea para mostrar, incluso datos viejos con espacios', () => {
  expect(formatPhone('+523312345678')).toBe('+52 33 1234 5678');
  expect(formatPhone('+52 33 0000 0000')).toBe('+52 33 0000 0000');
  expect(formatPhone(null)).toBe('');
});
