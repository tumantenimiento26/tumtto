// Utilidades puras de calendario para DatePicker / DateRangePicker.
// Semana L-D (México), cuadrícula 6×7.

export const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const sameDay = (
  a: Date | null | undefined,
  b: Date | null | undefined,
) =>
  !!a &&
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** 42 días (6 semanas) empezando en lunes, para el mes dado (0–11). */
export function monthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // lunes = 0
  const start = new Date(year, month, 1 - offset);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

/** Próximo lunes (si hoy es lunes, el de la semana siguiente). */
export function nextMonday(from = new Date()): Date {
  const d = startOfDay(from);
  const delta = (8 - d.getDay()) % 7 || 7;
  return addDays(d, delta);
}

export const WEEKDAYS_SHORT = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export const monthLabel = (year: number, month: number) =>
  new Date(year, month, 1).toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric',
  });

export const formatShort = (d: Date) =>
  d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });

export const formatLong = (d: Date) =>
  d.toLocaleDateString('es-MX', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export type DateRange = { from: Date; to: Date } | null;

/** Presets de rango (hacia atrás desde hoy). null = todas las fechas. */
export function rangePreset(
  kind: 'today' | '7d' | '30d' | '90d' | 'month' | 'lastMonth' | 'all',
  now = new Date(),
): DateRange {
  const today = startOfDay(now);
  switch (kind) {
    case 'today':
      return { from: today, to: today };
    case '7d':
      return { from: addDays(today, -6), to: today };
    case '30d':
      return { from: addDays(today, -29), to: today };
    case '90d':
      return { from: addDays(today, -89), to: today };
    case 'month':
      return {
        from: new Date(today.getFullYear(), today.getMonth(), 1),
        to: today,
      };
    case 'lastMonth':
      return {
        from: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        to: new Date(today.getFullYear(), today.getMonth(), 0),
      };
    default:
      return null;
  }
}

/** ¿`d` cae dentro del rango (inclusive)? */
export function inRange(d: Date, r: DateRange): boolean {
  if (!r) return true;
  const t = startOfDay(d).getTime();
  return t >= startOfDay(r.from).getTime() && t <= startOfDay(r.to).getTime();
}

/** Segundo clic de un rango: ordena los extremos. */
export function orderRange(a: Date, b: Date): { from: Date; to: Date } {
  return a <= b ? { from: a, to: b } : { from: b, to: a };
}
