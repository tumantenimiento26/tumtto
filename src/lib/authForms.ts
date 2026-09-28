// Reglas de formularios de acceso (login, registro, contraseña nueva). Puras
// para poder probarlas; las pantallas solo pintan el resultado.

export const EMAIL_RE = /\S+@\S+\.\S+/;

/** 0–4: largo ≥8, letra, número y (símbolo o ≥12). Igual que el handoff. */
export function passwordScore(p: string): number {
  if (!p) return 0;
  return Math.min(
    4,
    Number(p.length >= 8) +
      Number(/[a-z]/i.test(p)) +
      Number(/\d/.test(p)) +
      Number(/[^a-z0-9]/i.test(p) || p.length >= 12),
  );
}

export const SCORE_LABEL = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];

/** null si cumple: mínimo 8 caracteres, con al menos una letra y un número. */
export function passwordError(p: string): string | null {
  if (p.length < 8 || !/[a-z]/i.test(p) || !/\d/.test(p))
    return 'Mínimo 8 caracteres, con letras y números.';
  return null;
}

// ── Bloqueo por intentos fallidos (lado cliente) ─────────────────────────────
// ponytail: contador en el navegador; Supabase ya limita por IP en el
// servidor. Esto solo da feedback claro y frena reintentos a ciegas.
export const MAX_ATTEMPTS = 3;
export const LOCK_MS = 30_000;

export type LockState = { attempts: number; lockUntil: number };

/** Registra un fallo de credenciales: a los 3 bloquea 30 s y reinicia. */
export function registerFailure(s: LockState, now: number): LockState {
  const attempts = s.attempts + 1;
  return attempts >= MAX_ATTEMPTS
    ? { attempts: 0, lockUntil: now + LOCK_MS }
    : { attempts, lockUntil: s.lockUntil };
}

export const lockSecondsLeft = (s: LockState, now: number) =>
  Math.max(0, Math.ceil((s.lockUntil - now) / 1000));

export function failureMessage(s: LockState, now: number): string {
  const left = lockSecondsLeft(s, now);
  if (left > 0)
    return `Demasiados intentos. Espera ${left} segundos e inténtalo de nuevo.`;
  const remaining = MAX_ATTEMPTS - s.attempts;
  return `Correo o contraseña incorrectos. Te queda${
    remaining === 1 ? '' : 'n'
  } ${remaining} intento${remaining === 1 ? '' : 's'}.`;
}

/** Nombre corto para saludar ("Hola, María"). */
export function firstName(fullName: string | null | undefined, email: string) {
  const base = fullName?.trim() || email.split('@')[0] || '';
  const w = base.split(/[\s._-]+/)[0] ?? '';
  return w ? w[0].toUpperCase() + w.slice(1) : '';
}

/** "3312345678" → "33 1234 5678" (MX). */
export function formatMxPhone(digits: string) {
  const d = digits.replace(/\D/g, '').slice(0, 10);
  return [d.slice(0, 2), d.slice(2, 6), d.slice(6, 10)]
    .filter(Boolean)
    .join(' ');
}
