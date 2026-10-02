// Fechas de la consola siempre en hora de la ZMG, sin importar la zona del
// navegador del admin (las fechas del backend son UTC).
export const MX_TZ = 'America/Mexico_City';

export const fmtDate = (
  iso: string | number | Date,
  opts: Intl.DateTimeFormatOptions,
) => new Date(iso).toLocaleDateString('es-MX', { timeZone: MX_TZ, ...opts });

export const fmtDateTime = (
  iso: string | number | Date,
  opts: Intl.DateTimeFormatOptions,
) => new Date(iso).toLocaleString('es-MX', { timeZone: MX_TZ, ...opts });

const PARTS = new Intl.DateTimeFormat('en-US', {
  timeZone: MX_TZ,
  hourCycle: 'h23',
  hour: 'numeric',
  weekday: 'short',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const DOW: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Hora (0–23), día de la semana (0 = domingo) y día `YYYY-MM-DD` en la ZMG. */
export function mxParts(d: string | number | Date): { hour: number; dow: number; ymd: string } {
  const p: Record<string, string> = {};
  for (const x of PARTS.formatToParts(new Date(d))) p[x.type] = x.value;
  return {
    hour: Number(p.hour) % 24,
    dow: DOW[p.weekday] ?? 0,
    ymd: `${p.year}-${p.month}-${p.day}`,
  };
}

export const mxDay = (d: string | number | Date) => mxParts(d).ymd;
