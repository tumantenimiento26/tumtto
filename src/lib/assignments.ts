// Lógica pura de «Asignaciones» (solicitudes donde el cliente pidió que Tumtto
// asigne al técnico): filtros por pestaña, tiempo de espera, confirmación y
// mapeo de las notificaciones del backend. Probada en assignments.test.ts.
import { ALERT_MINUTES_DEFAULT } from './unassigned';

export type AssignmentTab =
  'pendientes' | 'asignadas' | 'confirmadas' | 'todas';

export const ASSIGNMENT_TABS: { value: AssignmentTab; label: string }[] = [
  { value: 'pendientes', label: 'Pendientes' },
  { value: 'asignadas', label: 'Asignadas' },
  { value: 'confirmadas', label: 'Confirmadas' },
  { value: 'todas', label: 'Todas' },
];

/** Fila de `admin_list_assignments` (ver docs/assignments.md del backend). */
export interface AssignmentRow {
  id: string;
  folio: number | null;
  created_at: string;
  category: { id: string; slug: string; name: string } | null;
  client: { id: string; name: string } | null;
  zone: { id: string; slug: string; name: string } | null;
  scheduled_for: string | null;
  scheduled_until: string | null;
  status: string;
  technician: { id: string; name: string } | null;
  assigned_by_admin_at: string | null;
  assignment_ack_at: string | null;
  waiting_minutes: number;
}

/** Sin técnico y todavía «requested»: falta asignar. */
export const isPending = (r: Pick<AssignmentRow, 'technician' | 'status'>) =>
  !r.technician && r.status === 'requested';
/** Con técnico y sin «Enterado». */
export const isAssignedUnconfirmed = (
  r: Pick<AssignmentRow, 'technician' | 'assignment_ack_at'>,
) => !!r.technician && !r.assignment_ack_at;
export const isConfirmed = (r: Pick<AssignmentRow, 'assignment_ack_at'>) =>
  !!r.assignment_ack_at;

export function filterAssignments(
  rows: AssignmentRow[],
  tab: AssignmentTab,
): AssignmentRow[] {
  const list =
    tab === 'pendientes'
      ? rows.filter(isPending)
      : tab === 'asignadas'
        ? rows.filter(isAssignedUnconfirmed)
        : tab === 'confirmadas'
          ? rows.filter(isConfirmed)
          : rows;
  return sortAssignments(list);
}

export function assignmentCounts(
  rows: AssignmentRow[],
): Record<AssignmentTab, number> {
  return {
    pendientes: rows.filter(isPending).length,
    asignadas: rows.filter(isAssignedUnconfirmed).length,
    confirmadas: rows.filter(isConfirmed).length,
    todas: rows.length,
  };
}

/** Pendientes primero (la más antigua arriba); el resto, la más nueva primero. */
export function sortAssignments(rows: AssignmentRow[]): AssignmentRow[] {
  const t = (r: AssignmentRow) => new Date(r.created_at).getTime();
  return [...rows].sort((a, b) => {
    const pa = isPending(a);
    const pb = isPending(b);
    if (pa !== pb) return pa ? -1 : 1;
    return pa ? t(a) - t(b) : t(b) - t(a);
  });
}

const minutesBetween = (fromIso: string, toMs: number) =>
  Math.max(0, Math.floor((toMs - new Date(fromIso).getTime()) / 60_000));

/**
 * Minutos de espera: en vivo desde la creación si sigue pendiente; congelados
 * (creación → asignación) si ya tiene técnico.
 */
export function waitingMinutes(r: AssignmentRow, now = Date.now()): number {
  if (isPending(r)) return minutesBetween(r.created_at, now);
  if (r.assigned_by_admin_at)
    return Math.max(
      0,
      Math.floor(
        (new Date(r.assigned_by_admin_at).getTime() -
          new Date(r.created_at).getTime()) /
          60_000,
      ),
    );
  return Math.max(0, r.waiting_minutes);
}

/** «8 min» / «2 h 05 min» / «1 d 3 h». */
export function minutesLabel(m: number): string {
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

/** Mismas reglas que la bandeja de Servicios (ageTone), con minutos. */
export function waitTone(
  minutes: number,
  alertMinutes = ALERT_MINUTES_DEFAULT,
): 'neutral' | 'warning' | 'danger' {
  if (minutes > alertMinutes) return 'danger';
  if (minutes >= alertMinutes / 2) return 'warning';
  return 'neutral';
}

/** Tono de la espera de una fila: sólo las pendientes alertan. */
export const rowWaitTone = (
  r: AssignmentRow,
  alertMinutes?: number,
  now = Date.now(),
) =>
  isPending(r) ? waitTone(waitingMinutes(r, now), alertMinutes) : 'neutral';

/** «hace 5 min» / «hace 2 h» / «hace 3 d». */
export function agoLabel(iso: string, now = Date.now()): string {
  const m = minutesBetween(iso, now);
  if (m < 1) return 'hace un momento';
  if (m < 60) return `hace ${m} min`;
  if (m < 1440) return `hace ${Math.floor(m / 60)} h`;
  return `hace ${Math.floor(m / 1440)} d`;
}

export type ConfirmationState = 'none' | 'waiting' | 'confirmed';

export const confirmationState = (
  r: Pick<AssignmentRow, 'technician' | 'assignment_ack_at'>,
): ConfirmationState =>
  r.assignment_ack_at ? 'confirmed' : r.technician ? 'waiting' : 'none';

/** «Esperando confirmación» / «Confirmada hace X»; null si aún no hay técnico. */
export function confirmationLabel(
  r: Pick<AssignmentRow, 'technician' | 'assignment_ack_at'>,
  now = Date.now(),
): string | null {
  const s = confirmationState(r);
  if (s === 'confirmed')
    return `Confirmada ${agoLabel(r.assignment_ack_at!, now)}`;
  return s === 'waiting' ? 'Esperando confirmación' : null;
}

// ── Respuesta del RPC ────────────────────────────────────────────────────────
const obj = (v: unknown): Record<string, unknown> | null =>
  v && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : null;
const str = (v: unknown): string | null => (typeof v === 'string' ? v : null);

/** Normaliza el jsonb de admin_list_assignments; descarta filas sin id/fecha. */
export function parseAssignments(raw: unknown): AssignmentRow[] {
  if (!Array.isArray(raw)) return [];
  const out: AssignmentRow[] = [];
  for (const item of raw) {
    const o = obj(item);
    const id = o && str(o.id);
    const created = o && str(o.created_at);
    if (!o || !id || !created) continue;
    const ref = (v: unknown) => {
      const r = obj(v);
      return r && str(r.id) ? r : null;
    };
    const cat = ref(o.category);
    const cli = ref(o.client);
    const zone = ref(o.zone);
    const tech = ref(o.technician);
    out.push({
      id,
      folio: typeof o.folio === 'number' ? o.folio : null,
      created_at: created,
      category: cat
        ? {
            id: str(cat.id)!,
            slug: str(cat.slug) ?? '',
            name: str(cat.name) ?? 'Servicio',
          }
        : null,
      client: cli
        ? { id: str(cli.id)!, name: str(cli.name) ?? 'Cliente' }
        : null,
      zone: zone
        ? {
            id: str(zone.id)!,
            slug: str(zone.slug) ?? '',
            name: str(zone.name) ?? '',
          }
        : null,
      scheduled_for: str(o.scheduled_for),
      scheduled_until: str(o.scheduled_until),
      status: str(o.status) ?? 'requested',
      technician: tech
        ? { id: str(tech.id)!, name: str(tech.name) ?? 'Técnico' }
        : null,
      assigned_by_admin_at: str(o.assigned_by_admin_at),
      assignment_ack_at: str(o.assignment_ack_at),
      waiting_minutes:
        typeof o.waiting_minutes === 'number' ? o.waiting_minutes : 0,
    });
  }
  return out;
}

// ── Notificaciones del backend ───────────────────────────────────────────────
export const ASSIGNMENT_NOTIF_KINDS = [
  'admin_request_created',
  'assignment_acknowledged',
] as const;
export type AssignmentNotifKind = (typeof ASSIGNMENT_NOTIF_KINDS)[number];

export const isAssignmentNotifKind = (k: string): k is AssignmentNotifKind =>
  (ASSIGNMENT_NOTIF_KINDS as readonly string[]).includes(k);

/** Ruta de una notificación: la solicitud nueva abre la bandeja; la confirmación, el servicio. */
export function assignmentNotifHref(
  kind: AssignmentNotifKind,
  entityId: string | null,
): string {
  if (kind === 'admin_request_created') return '/asignaciones';
  return entityId ? `/servicios/${entityId}` : '/asignaciones';
}
