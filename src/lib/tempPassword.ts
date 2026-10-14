// Contraseña temporal del alta directa de equipo y mensajes del cambio forzado.
// Puro: el generador recibe el azar por parámetro para poder probarlo.

export const TEMP_MIN = 10;
export const TEMP_MAX = 72;

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghijkmnopqrstuvwxyz';
const DIGITS = '23456789';
const SYMBOLS = '!#$%*+-=?@';

export type RandomInt = (maxExclusive: number) => number;

export const cryptoRandomInt: RandomInt = max => {
  const buf = new Uint32Array(1);
  globalThis.crypto.getRandomValues(buf);
  return buf[0] % max;
};

/** 14 caracteres sin ambiguos (0/O, 1/l/I) con mayúscula, minúscula, número y símbolo. */
export function generateTempPassword(
  rand: RandomInt = cryptoRandomInt,
  length = 14,
): string {
  const all = UPPER + LOWER + DIGITS + SYMBOLS;
  const pick = (set: string) => set[rand(set.length)];
  const chars = [pick(UPPER), pick(LOWER), pick(DIGITS), pick(SYMBOLS)];
  while (chars.length < Math.max(length, TEMP_MIN)) chars.push(pick(all));
  // Fisher-Yates para que los obligatorios no queden siempre al inicio.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

/** Misma regla que create_staff: 10-72 caracteres con letras y números. */
export function tempPasswordError(p: string): string | null {
  if (
    p.length < TEMP_MIN ||
    p.length > TEMP_MAX ||
    !/[a-z]/i.test(p) ||
    !/\d/.test(p)
  )
    return `Mínimo ${TEMP_MIN} caracteres, con letras y números.`;
  return null;
}

/** Teléfono opcional en E.164 MX (+52 + 10 dígitos) a partir de lo que se teclea. */
export function phoneToE164(raw: string): string | null {
  const d = raw.replace(/\D/g, '');
  const ten = d.length === 12 && d.startsWith('52') ? d.slice(2) : d;
  return ten.length === 10 ? `+52${ten}` : null;
}

/** Mensaje en español para un fallo de updateUser / complete_password_change. */
export function passwordChangeMessage(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes('different from the old') || m.includes('same password'))
    return 'La nueva contraseña debe ser distinta de la temporal.';
  if (
    m.includes('weak') ||
    m.includes('password should') ||
    m.includes('at least')
  )
    return 'Esa contraseña es muy débil. Usa 8 o más caracteres, con letras y números.';
  if (m.includes('aal2') || m.includes('reauth'))
    return 'Por seguridad, inicia sesión de nuevo para cambiar tu contraseña.';
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Demasiados intentos. Espera un minuto e inténtalo de nuevo.';
  if (m.includes('fetch') || m.includes('network'))
    return 'No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.';
  return 'No pudimos cambiar tu contraseña. Inténtalo de nuevo.';
}
