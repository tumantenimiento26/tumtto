import { describe, expect, it } from 'vitest';
import {
  failureMessage,
  firstName,
  formatMxPhone,
  lockSecondsLeft,
  passwordError,
  passwordScore,
  registerFailure,
} from './authForms';

describe('passwordScore', () => {
  it('suma largo, letra, número y símbolo', () => {
    expect(passwordScore('')).toBe(0);
    expect(passwordScore('abc')).toBe(1);
    expect(passwordScore('abcdefgh')).toBe(2);
    expect(passwordScore('abcdefg1')).toBe(3);
    expect(passwordScore('abcdef1!')).toBe(4);
    expect(passwordScore('abcdefghijk1')).toBe(4);
  });
});

describe('passwordError', () => {
  it('exige 8+, letra y número', () => {
    expect(passwordError('corta1')).not.toBeNull();
    expect(passwordError('solotexto')).not.toBeNull();
    expect(passwordError('12345678')).not.toBeNull();
    expect(passwordError('segura123')).toBeNull();
  });
});

describe('bloqueo por intentos', () => {
  it('avisa intentos restantes y bloquea al tercero 30 s', () => {
    let s = { attempts: 0, lockUntil: 0 };
    s = registerFailure(s, 1000);
    expect(failureMessage(s, 1000)).toContain('Te quedan 2 intentos');
    s = registerFailure(s, 1000);
    expect(failureMessage(s, 1000)).toContain('Te queda 1 intento.');
    s = registerFailure(s, 1000);
    expect(s.attempts).toBe(0);
    expect(lockSecondsLeft(s, 1000)).toBe(30);
    expect(failureMessage(s, 1000)).toContain('Espera 30 segundos');
    expect(lockSecondsLeft(s, 31_001)).toBe(0);
  });
});

describe('helpers', () => {
  it('saluda con el primer nombre', () => {
    expect(firstName('maría castillo', 'x@y.com')).toBe('María');
    expect(firstName(null, 'ramon.hernandez@gmail.com')).toBe('Ramon');
  });
  it('formatea celular MX', () => {
    expect(formatMxPhone('3312345678')).toBe('33 1234 5678');
    expect(formatMxPhone('33a12')).toBe('33 12');
  });
});
