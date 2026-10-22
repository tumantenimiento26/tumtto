import { describe, expect, test } from 'vitest';
import {
  cryptoRandomInt,
  generateTempPassword,
  passwordChangeMessage,
  phoneToE164,
  tempPasswordError,
} from './tempPassword';

describe('generateTempPassword', () => {
  test('cumple la regla del backend y tiene variedad', () => {
    for (let i = 0; i < 200; i++) {
      const p = generateTempPassword();
      expect(p).toHaveLength(14);
      expect(tempPasswordError(p)).toBeNull();
      expect(p).toMatch(/[A-Z]/);
      expect(p).toMatch(/[a-z]/);
      expect(p).toMatch(/\d/);
      expect(p).toMatch(/[^A-Za-z0-9]/);
      expect(p).not.toMatch(/[0O1lI]/);
    }
  });
  test('es determinista con el azar inyectado y nunca baja del mínimo', () => {
    const zero = () => 0;
    expect(generateTempPassword(zero)).toBe(generateTempPassword(zero));
    expect(generateTempPassword(zero, 4).length).toBe(10);
  });
  test('cryptoRandomInt queda en rango', () => {
    for (let i = 0; i < 100; i++) expect(cryptoRandomInt(7)).toBeLessThan(7);
  });
});

describe('tempPasswordError', () => {
  test('mínimo 10 con letras y números', () => {
    expect(tempPasswordError('abc123')).not.toBeNull();
    expect(tempPasswordError('abcdefghij')).not.toBeNull();
    expect(tempPasswordError('1234567890')).not.toBeNull();
    expect(tempPasswordError('abcde12345')).toBeNull();
    expect(tempPasswordError('a1'.repeat(37))).not.toBeNull(); // 74 > 72
  });
});

test('phoneToE164', () => {
  expect(phoneToE164('33 1234 5678')).toBe('+523312345678');
  expect(phoneToE164('+52 33 1234 5678')).toBe('+523312345678');
  expect(phoneToE164('123')).toBeNull();
  expect(phoneToE164('')).toBeNull();
});

test('passwordChangeMessage traduce los errores de Auth', () => {
  expect(
    passwordChangeMessage(
      'New password should be different from the old password.',
    ),
  ).toMatch(/distinta/);
  expect(
    passwordChangeMessage('Password should be at least 6 characters'),
  ).toMatch(/débil/);
  expect(passwordChangeMessage('boom')).toMatch(/No pudimos/);
});
