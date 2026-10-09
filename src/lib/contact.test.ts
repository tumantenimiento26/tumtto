import { describe, expect, it } from 'vitest';
import {
  DEFAULT_EMAIL,
  activeSocials,
  buildContact,
  displayPhone,
  mailLink,
  nationalMx,
  normalizeMxPhone,
  safeUrl,
  telLink,
  waLink,
} from './contact';

describe('normalizeMxPhone', () => {
  it.each([
    ['3312345678', '523312345678'],
    ['33 1234 5678', '523312345678'],
    ['+52 33 1234 5678', '523312345678'],
    ['(33) 1234-5678', '523312345678'],
    ['523312345678', '523312345678'],
    ['+5213312345678', '523312345678'],
  ])('%s → %s', (raw, out) => expect(normalizeMxPhone(raw)).toBe(out));

  it.each(['', '  ', '12345', '33123456789', 'abc', null, undefined])(
    'rechaza %s',
    raw => expect(normalizeMxPhone(raw)).toBeNull(),
  );

  it('nationalMx devuelve los 10 dígitos', () => {
    expect(nationalMx('+52 33 1234 5678')).toBe('3312345678');
  });
});

describe('buildContact', () => {
  it('sin env: canales ocultos y correo por defecto', () => {
    const c = buildContact({});
    expect(c.whatsapp).toBeNull();
    expect(c.phone).toBeNull();
    expect(c.email).toBe(DEFAULT_EMAIL);
    expect(activeSocials(c)).toEqual([]);
  });

  it('lee y normaliza el env', () => {
    const c = buildContact({
      NEXT_PUBLIC_CONTACT_WHATSAPP: '33 1234 5678',
      NEXT_PUBLIC_CONTACT_PHONE: '+52 33 9876 5432',
      NEXT_PUBLIC_CONTACT_EMAIL: 'hola@x.mx',
      NEXT_PUBLIC_CONTACT_INSTAGRAM: 'https://instagram.com/tum',
    });
    expect(c.whatsapp).toBe('523312345678');
    expect(c.phone).toBe('523398765432');
    expect(c.email).toBe('hola@x.mx');
    expect(activeSocials(c).map(s => s.key)).toEqual(['instagram']);
  });

  it('correo inválido cae al default', () => {
    expect(buildContact({ NEXT_PUBLIC_CONTACT_EMAIL: 'nope' }).email).toBe(DEFAULT_EMAIL);
  });

  it('safeUrl solo acepta http(s)', () => {
    expect(safeUrl('javascript:alert(1)')).toBeNull();
    expect(safeUrl('instagram.com/x')).toBeNull();
    expect(safeUrl('')).toBeNull();
    expect(safeUrl('https://x.com/a')).toBe('https://x.com/a');
  });
});

describe('link builders', () => {
  it('waLink codifica el mensaje', () => {
    expect(waLink('3312345678', 'Hola, ¿qué tal?')).toBe(
      `https://wa.me/523312345678?text=${encodeURIComponent('Hola, ¿qué tal?')}`,
    );
  });
  it('waLink sin mensaje o sin número', () => {
    expect(waLink('3312345678', '')).toBe('https://wa.me/523312345678');
    expect(waLink(null, 'x')).toBeNull();
  });
  it('telLink', () => {
    expect(telLink('33 1234 5678')).toBe('tel:+523312345678');
    expect(telLink(null)).toBeNull();
  });
  it('mailLink', () => {
    expect(mailLink('a@b.mx')).toBe('mailto:a@b.mx');
    expect(mailLink('a@b.mx', 'Re: hola ñ')).toBe(
      `mailto:a@b.mx?subject=${encodeURIComponent('Re: hola ñ')}`,
    );
    expect(mailLink(null)).toBeNull();
  });
  it('displayPhone', () => {
    expect(displayPhone('523312345678')).toBe('+52 33 1234 5678');
    expect(displayPhone(null)).toBe('');
  });
});
