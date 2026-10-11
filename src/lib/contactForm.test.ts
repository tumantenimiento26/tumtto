import { describe, expect, it } from 'vitest';
import {
  buildPayload,
  fieldError,
  validateContact,
  type ContactInput,
} from './contactForm';
import { parseSubmitResponse, submitErrorMessage } from './contactSubmit';

const ok: ContactInput = {
  name: 'Ana Pérez',
  email: 'ana@correo.mx',
  phone: '33 1234 5678',
  contact_type: 'client',
  message: 'Necesito un plomero para mañana.',
  consent: true,
};

describe('validateContact', () => {
  it('válido → sin errores', () => expect(validateContact(ok)).toEqual({}));

  it('vacío → todos los campos con error', () => {
    const e = validateContact({
      name: '',
      email: '',
      phone: '',
      contact_type: '',
      message: '',
      consent: false,
    });
    expect(Object.keys(e).sort()).toEqual(
      ['consent', 'contact_type', 'email', 'message', 'name', 'phone'].sort(),
    );
  });

  it('nombre 2–120', () => {
    expect(fieldError('name', { ...ok, name: 'A' })).toBeTruthy();
    expect(fieldError('name', { ...ok, name: 'Al' })).toBeNull();
    expect(fieldError('name', { ...ok, name: 'x'.repeat(121) })).toBeTruthy();
    expect(fieldError('name', { ...ok, name: ' A ' })).toBeTruthy();
  });

  it.each(['ana', 'ana@', 'a@b', 'a b@c.mx'])('correo inválido %s', email =>
    expect(fieldError('email', { ...ok, email })).toBeTruthy(),
  );

  it('teléfono: 10 dígitos, con o sin +52', () => {
    expect(fieldError('phone', { ...ok, phone: '+52 33 1234 5678' })).toBeNull();
    expect(fieldError('phone', { ...ok, phone: '331234567' })).toBeTruthy();
  });

  it('mensaje 10–2000', () => {
    expect(fieldError('message', { ...ok, message: 'corto' })).toBeTruthy();
    expect(fieldError('message', { ...ok, message: 'x'.repeat(10) })).toBeNull();
    expect(fieldError('message', { ...ok, message: 'x'.repeat(2001) })).toBeTruthy();
  });

  it('consentimiento obligatorio', () => {
    expect(fieldError('consent', { ...ok, consent: false })).toBeTruthy();
  });
});

describe('buildPayload', () => {
  it('normaliza y agrega honeypot + started_at', () => {
    const p = buildPayload({ ...ok, name: '  Ana  ' }, 1234);
    expect(p).toMatchObject({
      name: 'Ana',
      phone: '3312345678',
      consent: true,
      website: '',
      started_at: 1234,
    });
  });
});

describe('parseSubmitResponse', () => {
  it('éxito', () => expect(parseSubmitResponse(200, { ok: true })).toEqual({ ok: true }));
  it('429', () =>
    expect(parseSubmitResponse(429, { ok: false })).toEqual({ ok: false, kind: 'rate-limit' }));
  it('400 con errores', () =>
    expect(parseSubmitResponse(400, { ok: false, errors: { email: 'x' } })).toEqual({
      ok: false,
      kind: 'invalid',
      errors: { email: 'x' },
    }));
  it('500 y cuerpo vacío', () => {
    expect(parseSubmitResponse(500, null)).toEqual({ ok: false, kind: 'server' });
    expect(parseSubmitResponse(400, {})).toEqual({ ok: false, kind: 'server' });
  });
  it('mensaje de 429', () =>
    expect(submitErrorMessage({ ok: false, kind: 'rate-limit' })).toBe(
      'Demasiados intentos, intenta más tarde.',
    ));
});
