// Lógica pura de la bandeja «Sin asignar» (solicitudes sin técnico aceptadas y
// asignadas por el admin + emergencias vencidas). Probada en unassigned.test.ts.

import { fmtDate, fmtDateTime } from '@/lib/dates';

export const ALERT_MINUTES_KEY = 'unassigned_alert_minutes';
export const ALERT_MINUTES_DEFAULT = 30;

export interface UnassignedOrderLike {
  status: string;
  needs_manual_assignment?: boolean | null;
  technician_id?: string | null;
  assignment_mode?: string | null;
  created_at: string;
}

/** Entra a la bandeja: pide asignación manual, sigue «requested» y sin técnico. */
export const inUnassignedInbox = (o: UnassignedOrderLike) =>
  !!o.needs_manual_assignment && o.status === 'requested' && !o.technician_id;

/** Solicitud creada por el cliente sin elegir técnico (no emergencia). */
export const isAdminRequest = (o: Pick<UnassignedOrderLike, 'assignment_mode'>) =>
  o.assignment_mode === 'admin';

/** Reasignar/asignar solo mientras el técnico no va en camino. */
export const canReassignStatus = (status: string) =>
  status === 'requested' || status === 'accepted';

export const REASSIGN_BLOCKED_TIP =
  'Ya va en camino: no se puede reasignar. Cancela el servicio si hace falta.';

// ── Antigüedad ───────────────────────────────────────────────────────────────

export type AgeBucket = 'all' | '15m' | '30m' | '1h' | '24h';

export const AGE_BUCKETS: { value: AgeBucket; label: string; minutes: number }[] = [
  { value: 'all', label: 'Cualquiera', minutes: 0 },
  { value: '15m', label: '> 15 min', minutes: 15 },
  { value: '30m', label: '> 30 min', minutes: 30 },
  { value: '1h', label: '> 1 h', minutes: 60 },
  { value: '24h', label: '> 24 h', minutes: 1440 },
];

export const ageMinutes = (createdAt: string, now = Date.now()) =>
  Math.max(0, Math.floor((now - new Date(createdAt).getTime()) / 60_000));

export function matchesAge(createdAt: string, bucket: AgeBucket, now = Date.now()): boolean {
  const min = AGE_BUCKETS.find(b => b.value === bucket)?.minutes ?? 0;
  return bucket === 'all' || ageMinutes(createdAt, now) > min;
}

/** «8 min» / «2 h 05 min» / «1 d 3 h». */
export function ageLabel(createdAt: string, now = Date.now()): string {
  const m = ageMinutes(createdAt, now);
  if (m < 1) return 'ahora';
  if (m < 60) return `${m} min`;
  if (m < 1440) {
    const h = Math.floor(m / 60);
    const r = m % 60;
    return r ? `${h} h ${String(r).padStart(2, '0')} min` : `${h} h`;
  }
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  return h ? `${d} d ${h} h` : `${d} d`;
}

/** Color de la antigüedad: neutro < mitad del umbral, aviso hasta el umbral, rojo después. */
export function ageTone(
  createdAt: string,
  alertMinutes = ALERT_MINUTES_DEFAULT,
  now = Date.now(),
): 'neutral' | 'warning' | 'danger' {
  const m = ageMinutes(createdAt, now);
  if (m > alertMinutes) return 'danger';
  if (m >= alertMinutes / 2) return 'warning';
  return 'neutral';
}

/** ¿Debe alertar? En la bandeja y con más antigüedad que el umbral. */
export const isUnassignedAlert = (
  o: UnassignedOrderLike,
  alertMinutes = ALERT_MINUTES_DEFAULT,
  now = Date.now(),
) => inUnassignedInbox(o) && ageMinutes(o.created_at, now) > alertMinutes;

// ── Fecha deseada ────────────────────────────────────────────────────────────

/** «mié 7 oct · 10:00–12:00»; null si no hay fecha deseada. */
export function scheduleLabel(
  from: string | null | undefined,
  until: string | null | undefined,
): string | null {
  if (!from) return null;
  const day = fmtDate(from, { weekday: 'short', day: 'numeric', month: 'short' });
  const hm = (iso: string) =>
    fmtDateTime(iso, { hour: '2-digit', minute: '2-digit', hour12: false });
  return until ? `${day} · ${hm(from)}–${hm(until)}` : `${day} · ${hm(from)}`;
}

/** «+15%» del recargo por horario congelado en la orden (bps); null si no hay. */
export const scheduleSurchargeLabel = (bps: number | null | undefined): string | null => {
  if (!bps || bps <= 0) return null;
  const pct = bps / 100;
  return `+${Number.isInteger(pct) ? pct : pct.toFixed(2).replace(/0$/, '')}%`;
};

// ── Historial ────────────────────────────────────────────────────────────────

/**
 * Titular de un evento de estado cuando la nota describe una asignación:
 * «Asignado a X por Y» / «Reasignado a X…» / «Rechazado: motivo». Null = usar
 * la etiqueta del estado de siempre.
 */
export function assignmentHeadline(e: {
  to_status: string | null;
  note: string | null;
}): string | null {
  const n = e.note?.trim();
  if (!n) return null;
  if (/^(asignado|reasignado)\b/i.test(n)) return n;
  if (e.to_status === 'cancelled' && /^rechazad[oa]\b/i.test(n)) return n;
  return null;
}

/** Nota de evento que el backend (y la maqueta) escriben al rechazar. */
export const rejectNote = (reason: string) => `Rechazado: ${reason.trim()}`;
